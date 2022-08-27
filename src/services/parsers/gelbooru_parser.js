import BasicHTMLMoebooruParser from './basic_html_moebooru_parser.js';

class GelbooruParser extends BasicHTMLMoebooruParser {
  getClassTemplate() {
    return '.tag-type-%namespace% > a';
  }
  getTagGroups() {
    return {
      general: '',
      artist: 'creator:',
      copyright: 'series:',
      character: 'character:',
      metadata: 'meta:'
    };
  }
}

export default GelbooruParser;
