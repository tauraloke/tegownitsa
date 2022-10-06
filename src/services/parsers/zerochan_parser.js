import AbstractBasicParser from './abstract_basic_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';

export default class ZerochanParser extends AbstractBasicParser {
  /**
   * @returns {Promise<ResponseImage?>}
   */
  async extractFullSizeImage() {
    let $ = await this.getHtmlParser();
    try {
      let url = $($('#large > a.preview').get()[0]).attr('href');
      let [, width, height] = $($('#large > a.preview > img').get()[0])
        .attr('title')
        .match(/([0-9]+)x([0-9]+)/);
      return {
        url: url,
        width: parseInt(width),
        height: parseInt(height)
      };
    } catch {
      return null;
    }
  }
  /**
   * @returns {Promise<string[]?>}
   */
  async extractAuthorUrls() {
    try {
      let tags = await this.extractTags();
      const authorTag = tags.find((t) => t.match(/creator:Pixiv Id [0-9]+/));
      return [
        `https://www.pixiv.net/en/users/${
          authorTag.match(/creator:Pixiv Id ([0-9]+)/)[1]
        }`
      ];
    } catch {
      return null;
    }
  }
  /**
   * @returns {Promise<string?>}
   */
  async extractTitle() {
    return null;
  }
  /**
   * @returns {Promize<string[]?>}
   */
  async extractSourceUrls() {
    try {
      let $ = await this.getHtmlParser();
      let source = $('#menu')
        .text()
        .match(/Source(.*)Share\n/)[1];
      return source ? [source] : null;
    } catch {
      return null;
    }
  }
  getTagGroups() {
    return {
      mangaka: 'creator:',
      series: 'series:',
      character: 'character:'
    };
  }
  async tagGroupsExtractor(groupName, prefix) {
    let $ = await this.getHtmlParser();
    let _tags = [];
    $(`#tags li.${groupName} a`).each(function (i, el) {
      if (el) {
        _tags.push(
          prefix +
            decodeURI($(el).attr('href').substring(1)).replaceAll('+', ' ')
        );
      }
    });
    return _tags;
  }
}
