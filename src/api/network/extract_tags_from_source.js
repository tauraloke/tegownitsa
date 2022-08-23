const path = require('path');

module.exports = {
  run: async (_event, _db, url, snake_source_key) => {
    let sourceClass = require(path.join(
      '..',
      '..',
      'services',
      'parsers',
      snake_source_key + '_parser.js'
    ));
    return await new sourceClass(url).extractTags();
  }
};
