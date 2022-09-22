import AbstractBasicParser from './abstract_basic_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';

export default class AnimePicturesParser extends AbstractBasicParser {
  getTagGroups() {
    return {
      '': '',
      artist: 'creator:',
      copyright: 'series:',
      character: 'character:'
    };
  }
  async tagGroupsExtractor(groupName, prefix) {
    let _tags = [];
    let $ = await this.getHtmlParser();
    let filter = `.tags li a.${groupName}`;
    if (groupName == '') {
      filter = '.tags li a[class=" "]';
    }
    $(filter).each(function (i, el) {
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
      let anchor = $($('#get_image_link').get()[0]);
      let relUrl = anchor.attr('href');
      if (!relUrl) {
        return null;
      }
      let [, width, height] = anchor
        .attr('title')
        .match(/Download anime picture ([0-9]+)x([0-9]+) /);
      return {
        url: `https://anime-pictures.net${relUrl}`,
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
    try {
      let $ = await this.getHtmlParser();
      let urls = null;
      $('#content > div > div').each(function (i, el) {
        if ($(el).text().match('About artist')) {
          urls = $(el)
            .find('a')
            .get()
            .map((l) => $(l).attr('href'))
            .filter((h) => h);
        }
      });
      return urls;
    } catch {
      return null;
    }
  }
}
