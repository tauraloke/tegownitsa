import AbstractBasicParser from './abstract_basic_parser.js';

export default class ZerochanParser extends AbstractBasicParser {
  getTagGroups() {
    return {
      mangaka: 'creator:',
      series: 'series:',
      character: 'character:'
    };
  }
  tagGroupsExtractor(groupName, prefix, $) {
    let _tags = [];
    $(`#tags li.${groupName} a`).each(function (i, el) {
      if (el) {
        _tags.push(
          prefix +
            decodeURI($(el).attr('href').substring(1)).replaceAll('+', ' ')
        );
      }
    });
    return _tags;
  }
}
