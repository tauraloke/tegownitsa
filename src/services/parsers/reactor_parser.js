import AbstractBasicParser from './abstract_basic_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';
import fetchUrl from 'node-fetch';

export default class ReactorParser extends AbstractBasicParser {
  /**
   * @returns {Promise<ResponseImage?>}
   */
  async extractFullSizeImage() {
    try {
      let json = await this.getJson();
      let item = json.data.node.attributes.filter(
        (a) => a.type == 'PICTURE'
      )[0];
      let id = Buffer.from(item.id, 'base64').toString('ascii').split(':')[1];
      let type = item.image.type.toLowerCase();
      let tags = encodeURIComponent(
        json.data.node.tags
          .slice(0, 4)
          .map((t) => t.name.replace(/\s/g, '-'))
          .join('-')
      );
      return {
        url: `https://img2.joyreactor.cc/pics/post/full/${tags}-${id}.${type}`,
        width: item.image.width,
        height: item.image.height
      };
    } catch (error) {
      console.log('failed to parse image', error, this.url);
      return null;
    }
  }
  /**
   * @returns {Promize<string[]?>}
   */
  async extractSourceUrls() {
    return null;
  }
  /**
   * @returns {Promise<string?>}
   */
  async extractTitle() {
    let json = await this.getJson();
    try {
      return json.data.node.text.match(/<h3>(.*?)<\/h3>/)[1];
    } catch {
      return null;
    }
  }
  /**
   * @returns {Promise<string[]?>}
   */
  async extractAuthorUrls() {
    return null;
  }
  getItemId() {
    if (this.itemId) {
      return this.itemId;
    }
    let parseUrl = this.url.match(/\/post\/([0-9]+)/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    throw `Cannot parse url ${this.url}`;
  }
  getFetchUrl() {
    return 'https://api.joyreactor.cc/graphql';
  }
  getBase64PostId() {
    return Buffer.from(`Post:${this.getItemId()}`).toString('base64');
  }
  async getBuffer() {
    this._buffer =
      this._buffer ||
      (await (
        await fetchUrl(this.getFetchUrl(), {
          headers: {
            'User-Agent': this.getUserAgent(),
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({
            operationName: null,
            variables: {},
            query: `
            {
              node(id: "${this.getBase64PostId()}") {
                ... on Post {
                  header
                  locale
                  text
                  attributes{
                    id
                    type
                    image{
                      width
                      height
                      type
                    }
                  }
                  tags {
                    name
                    category {
                      name
                    }
                    unsafe
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
  async extractTags() {
    try {
      let json = await this.getJson();
      let tags = json.data.node.tags
        .map((t) => {
          if (t.category && t.category.name == 'artist') {
            return `creator:${t.name}`;
          }
          return t.name;
        })
        .filter((t) => t);
      return tags;
    } catch (error) {
      console.log('Cannot parse url', this.url, error);
      return [];
    }
  }
}
