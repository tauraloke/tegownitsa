const sourceTypes = require('../../source_type.json');

module.exports = {
  run: async (_event, _db, name) => {
    return sourceTypes[name];
  }
};
