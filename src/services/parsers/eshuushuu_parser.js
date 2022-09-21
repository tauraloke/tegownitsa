import AbstractBasicParser from './abstract_basic_parser.js';

export default class EshuushuuParser extends AbstractBasicParser {
  getTagGroups() {
    return {
      1: '',
      2: 'series:',
      4: 'character:',
      3: 'creator:'
    };
  }
  async tagGroupsExtractor(groupName, prefix) {
    let _tags = [];
    let $ = await this.getHtmlParser();
    $(`[id^='quicktag${groupName}'] > .tag > a`).each(function (i, el) {
      if (el) {
        _tags.push(prefix + $(el).text());
      }
    });
    return _tags;
  }
  /**
   * @returns {Promise<string?>}
   */
  async extractFullSizeImageUrl() {
    try {
      let $ = await this.getHtmlParser();
      let relUrl = $($('div.image_block > div.thumb > a').get()[0]).attr(
        'href'
      );
      return relUrl ? `https://e-shuushuu.net${relUrl}` : null;
    } catch {
      return null;
    }
  }
  /**
   * @returns {Promize<string[]?>}
   */
  async extractSourceUrls() {
    return null;
  }
  /**
   * @returns {Promise<string?>}
   */
  async extractTitle() {
    return null;
  }
  /**
   * @returns {Promise<string[]?>}
   */
  async extractAuthorUrls() {
    return null;
  }
}
