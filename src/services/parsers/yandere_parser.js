const BasicHTMLMoebooruParser = require('./basic_html_moebooru_parser.js');

class YandereParser extends BasicHTMLMoebooruParser {
  getClassTemplate() {
    return '.tag-type-%namespace% a:nth-of-type(2)';
  }
}

module.exports = YandereParser;
