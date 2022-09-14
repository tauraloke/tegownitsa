import BasicJsonMoebooruParser from './basic_json_moebooru_parser.js';

export default class KonachanParser extends BasicJsonMoebooruParser {
  /**
   * @returns {string}
   */
  getFetchUrl() {
    return `https://konachan.com/post.json?tags=id:${this.getItemId()}&include_tags=1&api_version=2`;
  }
}
