import AbstractBasicParser from './abstract_basic_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';

export default class FuraffinityParser extends AbstractBasicParser {
  getTagGroups() {
    return {
      '.submission-sidebar .tags-row .tags': '',
      '.section-header .submission-id-sub-container a strong': 'creator:'
    };
  }
  async tagGroupsExtractor(groupName, prefix) {
    let _tags = [];
    let $ = await this.getHtmlParser();
    $(groupName).each(function (i, el) {
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
      let url = $($('#submissionImg').get()[0]).attr('src');
      if (!url) {
        return null;
      }
      if (url[0] == '/') {
        url = `https:${url}`;
      }
      let [, width, height] = $(
        '#columnpage > div.submission-sidebar > section.info.text'
      )
        .text()
        .match(/Size ([0-9]+) x ([0-9]+)/);
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
   * @returns {Promize<string[]?>}
   */
  async extractSourceUrls() {
    return null;
  }
  /**
   * @returns {Promise<string?>}
   */
  async extractTitle() {
    try {
      let $ = await this.getHtmlParser();
      return $(
        $('div.submission-id-sub-container > div > h2 > p').get()[0]
      ).text();
    } catch {
      return null;
    }
  }
  /**
   * @returns {Promise<string[]?>}
   */
  async extractAuthorUrls() {
    try {
      let $ = await this.getHtmlParser();
      let relUrl = $($('div.submission-id-avatar > a').get()[0]).attr('href');
      return relUrl ? [`https://www.furaffinity.net${relUrl}`] : null;
    } catch {
      return null;
    }
  }
}
