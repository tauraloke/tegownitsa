import AbstractBasicParser from './abstract_basic_parser.js';

export default class BasicMoebooruParser extends AbstractBasicParser {
  /**
   * @returns {Object<string, string>}
   */
  getTagGroups() {
    return {
      general: '',
      artist: 'creator:',
      copyright: 'series:',
      character: 'character:',
      meta: 'meta:'
    };
  }
  /**
   * @returns {Promise<string[]?>}
   */
  async extractAuthorUrls() {
    return null;
  }
  /**
   * @returns {Promise<string?>}
   */
  async extractTitle() {
    return null;
  }
}
