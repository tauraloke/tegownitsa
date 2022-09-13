import AbstractBasicParser from './abstract_basic_parser.js';

export default class AnimePicturesParser extends AbstractBasicParser {
  getTagGroups() {
    return {
      '': '',
      artist: 'creator:',
      copyright: 'series:',
      character: 'character:'
    };
  }
  tagGroupsExtractor(groupName, prefix, $) {
    let _tags = [];
    let filter = `.tags li a.${groupName}`;
    if (groupName == '') {
      filter = '.tags li a[class=" "]';
    }
    $(filter).each(function (i, el) {
      if (el) {
        _tags.push(prefix + $(el).text());
      }
    });
    return _tags;
  }
}
