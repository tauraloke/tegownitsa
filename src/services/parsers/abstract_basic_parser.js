const cheerio = require('cheerio');
const fetch = require('node-fetch');

class AbstractBasicParser {
  constructor(url) {
    if (url.match('^//')) {
      url = `https:${url}`;
    }
    this.url = url;
  }
  async getBuffer() {
    this.buffer ||= await (await fetch(this.url)).text();
    return this.buffer;
  }
  // @Abstract
  getTagGroups() {
    throw { error: 'Direct call of an abstract method' };
  }
  async extractTags() {
    let $ = cheerio.load(await this.getBuffer());
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

module.exports = AbstractBasicParser;
