import AbstractBasicParser from './abstract_basic_parser.js';

export default class FuraffinityParser extends AbstractBasicParser {
  getTagGroups() {
    return {
      '.submission-sidebar .tags-row .tags': '',
      '.section-header .submission-id-sub-container a strong': 'creator:'
    };
  }
  tagGroupsExtractor(groupName, prefix, $) {
    let _tags = [];
    $(groupName).each(function (i, el) {
      if (el) {
        _tags.push(prefix + $(el).text());
      }
    });
    return _tags;
  }
}
