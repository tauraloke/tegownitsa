const BasicMetaMoebooruParser = require('./basic_meta_moebooru_parser.js');

class KonachanParser extends BasicMetaMoebooruParser {
  getClassTemplate() {
    return 'li.tag-type-%namespace%';
  }
  getTagAttr() {
    return 'data-name';
  }
}

module.exports = KonachanParser;
