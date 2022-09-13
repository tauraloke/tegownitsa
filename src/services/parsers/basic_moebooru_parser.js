import AbstractBasicParser from './abstract_basic_parser.js';

export default class BasicMoebooruParser extends AbstractBasicParser {
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
