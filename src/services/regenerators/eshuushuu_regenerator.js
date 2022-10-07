import AbstractRegenerator from './abstract_regenerator.js';

export default class EshuushuuRegenerator extends AbstractRegenerator {
  /**
   * @returns {Promise<string>}
   */
  async regenerateUrl() {
    let match = this.url.match(/-([0-9]+)\./);
    if (match) {
      let item_id = match[1];
      return `https://e-shuushuu.net/image/${item_id}/`;
    }
  }
}
