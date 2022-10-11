import { applicationUserAgent } from '../utils.js';
import AbstractRegenerator from './abstract_regenerator.js';
import fetch from 'node-fetch';

export default class ReactorRegenerator extends AbstractRegenerator {
  /**
   * @returns {string}
   */
  getId() {
    let id = this.url.match(
      /-([0-9]+)\.(jpg|png|jpeg|gif|tiff|avif|bmp|webp)$/
    )[1];
    if (!id) {
      throw { message: 'cannot parse url', url: this.url };
    }
    return id;
  }
  getBase64PostId() {
    return Buffer.from(`PostAttributePicture:${this.getId()}`).toString(
      'base64'
    );
  }
  /**
   * @returns {string}
   */
  async getBuffer() {
    this._buffer =
      this._buffer ||
      (await (
        await fetch('https://api.joyreactor.cc/graphql', {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': applicationUserAgent()
          },
          method: 'POST',
          body: JSON.stringify({
            operationName: null,
            variables: {},
            query: `
            {
              node(id: "${this.getBase64PostId()}") {
                ... on PostAttributePicture {
                  post {
                    id
                  }
                }
              }
            }          
            `
          })
        })
      ).text());
    return this._buffer;
  }
  async getPostId() {
    let json = JSON.parse(await this.getBuffer());
    return Buffer.from(json.data.node.post.id, 'base64')
      .toString('ascii')
      .split(':')[1];
  }
  /**
   * @returns {Promise<string>}
   */
  async regenerateUrl() {
    return `https://reactor.cc/post/${await this.getPostId()}`;
  }
}
