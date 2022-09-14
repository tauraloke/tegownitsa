import fetchUrl from 'node-fetch';
import { load } from 'cheerio';

export default class AbstractBasicParser {
  /**
   * @param {string} url
   */
  constructor(url) {
    if (url.match('^//')) {
      url = `https:${url}`;
    }
    this.url = url;
  }
  getFetchUrl() {
    return this.url;
  }
  async getBuffer() {
    this.buffer =
      this.buffer || (await (await fetchUrl(this.getFetchUrl())).text());
    return this.buffer;
  }
  // @Abstract
  getTagGroups() {
    throw { error: 'Direct call of an abstract method' };
  }
  async extractTags() {
    let $ = load(await this.getBuffer());
    let tags = [];
    Object.keys(this.getTagGroups()).forEach((name) => {
      let prefix = this.getTagGroups()[name];
      tags.push(...this.tagGroupsExtractor(name, prefix, $));
    });
    return tags;
  }
  // @Abstract
  tagGroupsExtractor(_groupName, _prefix, _$) {
    throw { error: 'Direct call of an interface method!' };
  }
  // @Abstract
  getClassTemplate() {
    throw { error: 'Direct call of an interface method!' };
  }
}
