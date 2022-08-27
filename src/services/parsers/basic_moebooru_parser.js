import AbstractBasicParser from './abstract_basic_parser.js';

class BasicMoebooruParser extends AbstractBasicParser {
  getTagGroups() {
    return {
      general: '',
      artist: 'creator:',
      copyright: 'series:',
      character: 'character:',
      meta: 'meta:'
    };
  }
}

export default BasicMoebooruParser;
