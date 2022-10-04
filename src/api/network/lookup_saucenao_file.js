import FormData from 'form-data';
import { createReadStream } from 'fs';
import fetch from 'node-fetch';
import config from '../../config/store.js';
import sourceTypes from '../../config/source_type.json';

export async function run(_event, db, file) {
  let form = new FormData();
  form.append('output_type', 2);
  let api_key = config.get('tag_source_saucenao_api_key');
  if (api_key) {
    form.append('api_key', api_key);
  }
  form.append('file', createReadStream(file['preview_path']));
  try {
    let response = await (
      await fetch('https://saucenao.com/search.php', {
        method: 'POST',
        body: form
      })
    ).text();
    let jsonData = JSON.parse(response);
    await db.run(
      'INSERT INTO pollee_file_sources (file_id, source) VALUES (?, ?)',
      [file.id, sourceTypes.SAUCENAO]
    );
    config.set(
      'tag_source_saucenao_last_date',
      new Date().toLocaleDateString()
    );
    config.set('tag_source_saucenao_limit', jsonData.header.long_limit);
    config.set('tag_source_saucenao_remaining', jsonData.header.long_remaining);
    return jsonData;
  } catch (error) {
    console.log(
      'Cannot fetch saucenao result on ',
      file['preview_path'],
      error
    );
    return {};
  }
}
