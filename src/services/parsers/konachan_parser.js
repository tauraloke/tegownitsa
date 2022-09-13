import BasicMetaMoebooruParser from './basic_meta_moebooru_parser.js';

export default class KonachanParser extends BasicMetaMoebooruParser {
  getClassTemplate() {
    return 'li.tag-type-%namespace%';
  }
  getTagAttr() {
    return 'data-name';
  }
}
