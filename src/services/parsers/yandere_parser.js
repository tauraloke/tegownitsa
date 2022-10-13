import BasicJsonMoebooruParser from './basic_json_moebooru_parser.js';

export default class YandereParser extends BasicJsonMoebooruParser {
  /**
   * @returns {Promise<string?>}
   */
  async extractTitle() {
    return null;
  }
  /**
   * @returns {string}
   */
  getFetchUrl() {
    return `https://yande.re/post.json?tags=id:${this.getItemId()}&api_version=2&include_tags=1`;
  }
  /**
   * @returns {Promise<boolean>}
   */
  async isSafeForWork() {
    let json = await this.getJson();
    const safeRatings = ['s'];
    return safeRatings.includes(json.posts[0].rating);
  }
}
