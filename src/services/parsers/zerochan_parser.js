import AbstractBasicParser from './abstract_basic_parser.js';

export default class ZerochanParser extends AbstractBasicParser {
  /**
   * @returns {Promise<string?>}
   */
  async extractFullSizeImageUrl() {
    let $ = await this.getHtmlParser();
    try {
      return $($('#large > a.preview').get()[0]).attr('href');
    } catch (e) {
      console.log(e);
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
    return null;
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
