const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');
const config = require('../../config/store.js');

module.exports = {
  run: async (_event, _db, file_path) => {
    let form = new FormData();
    form.append('output_type', 2);
    let api_key = config.get('tag_source_saucenao_api_key');
    if (api_key) {
      form.append('api_key', api_key);
    }
    form.append('file', fs.createReadStream(file_path));
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
};
