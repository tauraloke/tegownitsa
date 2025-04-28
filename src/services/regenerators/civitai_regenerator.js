import AbstractRegenerator from './abstract_regenerator.js';

export default class E621Regenerator extends AbstractRegenerator {
  /**
   * @returns {string}
   */
  getImageID() {
    let md5 = this.url.toLowerCase().match(/\/(\d+)\.jpeg$/)?.[1];
    if (!md5) {
      throw { message: 'cannot parse url', url: this.url };
    }
    return md5;
  }
  /**
   * @returns {Promise<string>}
   */
  async regenerateUrl() {
    return `https://civitai.com/api/trpc/tag.getVotableTags?input=%7B%22json%22%3A%7B%22id%22%3A${this.getImageID()}%2C%22type%22%3A%22image%22%2C%22authed%22%3Atrue%7D%7D`;
  }
}
