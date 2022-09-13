import BasicHTMLMoebooruParser from './basic_html_moebooru_parser.js';

export default class SankakuParser extends BasicHTMLMoebooruParser {
  getClassTemplate() {
    return '.tag-type-%namespace% > a';
  }
}
