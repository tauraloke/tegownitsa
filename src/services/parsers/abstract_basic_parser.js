import fetchUrl from 'node-fetch';
import { load } from 'cheerio';

class AbstractBasicParser {
  constructor(url) {
    if (url.match('^//')) {
      url = `https:${url}`;
    }
    this.url = url;
  }
  async getBuffer() {
    this.buffer = this.buffer || (await (await fetchUrl(this.url)).text());
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

export default AbstractBasicParser;
