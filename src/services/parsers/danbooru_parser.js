import BasicMetaMoebooruParser from './basic_meta_moebooru_parser.js';

class DanbooruParser extends BasicMetaMoebooruParser {
  getClassTemplate() {
    return '.%namespace%-tag-list li';
  }
  getTagAttr() {
    return 'data-tag-name';
  }
}

export default DanbooruParser;
