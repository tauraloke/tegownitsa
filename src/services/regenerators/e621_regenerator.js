import AbstractRegenerator from './abstract_regenerator.js';
import fetch from 'node-fetch';
import { applicationUserAgent, sleep } from '../utils.js';

export default class E621Regenerator extends AbstractRegenerator {
  /**
   * @returns {string}
   */
  getMD5() {
    let md5 = this.url.toLowerCase().match(/([0-9a-f]{32})\./)[1];
    if (!md5) {
      throw { message: 'cannot parse url', url: this.url };
    }
    return md5;
  }
  /**
   * @returns {Promise<string>}
   */
  async regenerateUrl() {
    let response = JSON.parse(
      await (
        await fetch(`https://e621.net/posts.json?tags=md5%3A${this.getMD5()}`, {
          headers: { 'User-Agent': applicationUserAgent() },
          method: 'GET'
        })
      ).text()
    );
    await sleep(1000);
    return `https://e621.net/posts/${response[0].id}`;
  }
}
