import AbstractRegenerator from './abstract_regenerator.js';
import fetch from 'node-fetch';
import { applicationUserAgent, sleep } from '../utils.js';
import config from '../../config/store.js';

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
  getUserAgent() {
    const username = config.get('e621_username');
    if (!username) {
      throw 'We do not recommend to request this source without a username in user-agent, see https://e621.net/help/api';
    }
    return `${applicationUserAgent()} / e621 username: ${username}`;
  }
  /**
   * @returns {Promise<string>}
   */
  async regenerateUrl() {
    let response = JSON.parse(
      await (
        await fetch(`https://e621.net/posts.json?tags=md5%3A${this.getMD5()}`, {
          headers: { 'User-Agent': this.getUserAgent() },
          method: 'GET'
        })
      ).text()
    );
    await sleep(1000);
    return `https://e621.net/posts/${response.posts[0].id}`;
  }
}
