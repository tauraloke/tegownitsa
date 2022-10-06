export default class AbstractRegenerator {
  /**
   * @param {string} url
   */
  constructor(url) {
    this.url = url;
  }
  /**
   * @abstract
   * @returns {Promise<string>}
   */
  async regenerateUrl() {
    throw 'Define abstract method regenerateUrl()!';
  }
}
