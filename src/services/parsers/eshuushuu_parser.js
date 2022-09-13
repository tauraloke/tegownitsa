import AbstractBasicParser from './abstract_basic_parser.js';

export default class EshuushuuParser extends AbstractBasicParser {
  getTagGroups() {
    return {
      1: '',
      2: 'series:',
      4: 'characters:',
      3: 'creator:'
    };
  }
  tagGroupsExtractor(groupName, prefix, $) {
    let _tags = [];
    $(`[id^='quicktag${groupName}'] > .tag > a`).each(function (i, el) {
      if (el) {
        _tags.push(prefix + $(el).text());
      }
    });
    return _tags;
  }
}
