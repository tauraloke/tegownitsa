import BasicHTMLMoebooruParser from './basic_html_moebooru_parser.js';

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
   * @returns {Promise<string?>}
   */
  async extractFullSizeImageUrl() {
    try {
      let $ = await this.getHtmlParser();
      let url = null;
      $('#tag-list > li > a').each(function (i, el) {
        if (el && $(el).text() == 'Original image') {
          url = $(el).attr('href');
        }
      });
      return url;
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
}
