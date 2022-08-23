const prompt = require('electron-prompt');

module.exports = {
  run: async (_event, _db) => {
    return await prompt({
      title: 'input image url here',
      label: 'URL:',
      value: '',
      inputAttrs: {
        type: 'url'
      },
      type: 'input'
    });
  }
};
