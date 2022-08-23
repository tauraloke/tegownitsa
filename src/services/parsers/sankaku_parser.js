const BasicHTMLMoebooruParser = require('./basic_html_moebooru_parser.js');

class SankakuParser extends BasicHTMLMoebooruParser {
  getClassTemplate() {
    return '.tag-type-%namespace% > a';
  }
}

module.exports = SankakuParser;
