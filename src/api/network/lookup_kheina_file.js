import FormData from 'form-data';
import { createReadStream } from 'fs';
import fetch from 'node-fetch';
import sourceTypes from '../../config/source_type.json';
import { applicationUserAgent } from '@/services/utils.js';

export async function run(_event, db, file) {
  let form = new FormData();
  form.append('file', createReadStream(file['preview_path']));
  try {
    let response = await (
      await fetch('https://api.kheina.com/v1/search', {
        headers: { 'User-Agent': applicationUserAgent() },
        method: 'POST',
        body: form
      })
    ).text();
    let jsonData = JSON.parse(response);
    await db.run(
      'INSERT INTO pollee_file_sources (file_id, source) VALUES (?, ?)',
      [file.id, sourceTypes.KHEINA]
    );
    return jsonData;
  } catch (error) {
    console.log('Cannot fetch kheina result on ', file['preview_path'], error);
    return {};
  }
}
