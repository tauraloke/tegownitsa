import AbstractRegenerator from './abstract_regenerator.js';

export default class PixivRegenerator extends AbstractRegenerator {
  /**
   * @returns {string}
   */
  getId() {
    let id = this.url.match(/\/([0-9]+)_p[0-9]/)[1];
    if (!id) {
      throw { message: 'cannot parse url', url: this.url };
    }
    return id;
  }
  /**
   * @returns {Promise<string>}
   */
  async regenerateUrl() {
    return `https://www.pixiv.net/en/artworks/${this.getId()}`;
  }
}
