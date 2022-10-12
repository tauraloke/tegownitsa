import AbstractBasicParser from './abstract_basic_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';

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
   * @returns {Promise<ResponseImage?>}
   */
  async extractFullSizeImage() {
    try {
      let $ = await this.getHtmlParser();
      let relUrl = $($('div.image_block > div.thumb > a').get()[0]).attr(
        'href'
      );
      if (!relUrl) {
        return null;
      }
      let [, width, height] = $('.meta > dl')
        .text()
        .match(/Dimensions:\n.*?([0-9]+)x([0-9]+)/);
      return {
        url: `https://e-shuushuu.net${relUrl}`,
        width: parseInt(width),
        height: parseInt(height)
      };
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
  /**
   * @returns {Promise<boolean>}
   */
  async isSafeForWork() {
    return true;
  }
}
