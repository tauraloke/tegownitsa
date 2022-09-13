import BasicHTMLMoebooruParser from './basic_html_moebooru_parser.js';

export default class YandereParser extends BasicHTMLMoebooruParser {
  getClassTemplate() {
    return '.tag-type-%namespace% a:nth-of-type(2)';
  }
}
