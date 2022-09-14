import BasicJsonMoebooruParser from './basic_json_moebooru_parser.js';

export default class YandereParser extends BasicJsonMoebooruParser {
  /**
   * @returns {string}
   */
  getFetchUrl() {
    return `https://yande.re/post.json?tags=id:${this.getItemId()}&api_version=2&include_tags=1`;
  }
}
