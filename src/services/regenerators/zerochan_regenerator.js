import AbstractRegenerator from './abstract_regenerator.js';

export default class YandereRegenerator extends AbstractRegenerator {
  /**
   * @returns {string}
   */
  getId() {
    let id = this.url.match(/\.([0-9]+)\.(jpg|jpeg|png|gif|avif|webp)/)[1];
    if (!id) {
      throw { message: 'cannot parse url', url: this.url };
    }
    return id;
  }
  /**
   * @returns {Promise<string>}
   */
  async regenerateUrl() {
    return `https://www.zerochan.net/${this.getId()}`;
  }
}
