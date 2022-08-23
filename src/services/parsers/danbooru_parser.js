const BasicMetaMoebooruParser = require('./basic_meta_moebooru_parser.js');

class DanbooruParser extends BasicMetaMoebooruParser {
  getClassTemplate() {
    return '.%namespace%-tag-list li';
  }
  getTagAttr() {
    return 'data-tag-name';
  }
}

module.exports = DanbooruParser;
