const { CAPTION_YET_NOT_SCANNED } = require('../../constants.json');

module.exports = {
  run: async (_event, _db, file) => {
    return file['caption'] == CAPTION_YET_NOT_SCANNED;
  }
};
