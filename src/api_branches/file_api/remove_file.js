const fs = require('fs');

module.exports = {
  run: async (_event, _db, filePath) => {
    fs.unlinkSync(filePath);
  }
};
