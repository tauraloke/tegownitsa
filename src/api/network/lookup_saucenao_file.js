import FormData from 'form-data';
import { createReadStream } from 'fs';
import fetch from 'node-fetch';
import config from '../../config/store.js';

export async function run(_event, _db, file_path) {
  let form = new FormData();
  form.append('output_type', 2);
  let api_key = config.get('tag_source_saucenao_api_key');
  if (api_key) {
    form.append('api_key', api_key);
  }
  form.append('file', createReadStream(file_path));
  try {
    let response = await (
      await fetch('https://saucenao.com/search.php', {
        method: 'POST',
        body: form
      })
    ).text();
    let jsonData = JSON.parse(response);
    return jsonData;
  } catch (error) {
    console.log('Cannot fetch saucenao result on ', file_path, error);
    return {};
  }
}
