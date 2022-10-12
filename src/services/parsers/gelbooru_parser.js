import BasicHTMLMoebooruParser from './basic_html_moebooru_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';

export default class GelbooruParser extends BasicHTMLMoebooruParser {
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
  /**
   * @returns {Promise<ResponseImage?>}
   */
  async extractFullSizeImage() {
    try {
      let $ = await this.getHtmlParser();
      let url = null;
      $('#tag-list > li > a').each(function (i, el) {
        if (el && $(el).text() == 'Original image') {
          url = $(el).attr('href');
        }
      });
      if (!url) {
        return null;
      }
      let [, width, height] = $('#tag-list')
        .text()
        .match(/\tSize: ([0-9]+)x([0-9]+)/);
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
    try {
      let $ = await this.getHtmlParser();
      let url = null;
      $('#tag-list > li').each(function (i, el) {
        if (
          el &&
          $(el)
            .text()
            .match(/^Source:/)
        ) {
          url = $($(el).find('a').get()[0]).attr('href');
        }
      });
      return url ? [url] : null;
    } catch {
      return null;
    }
  }
  /**
   * @returns {Promise<boolean>}
   */
  async isSafeForWork() {
    try {
      let $ = await this.getHtmlParser();
      const safeRatings = ['general'];
      let rating = $($('meta[name="rating"]').get()[0]).attr('content').trim();
      return safeRatings.includes(rating);
    } catch {
      return true;
    }
  }
}
