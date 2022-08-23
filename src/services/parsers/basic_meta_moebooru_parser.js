const BasicMoebooruParser = require('./basic_moebooru_parser.js');

// @Abstract
class BasicMetaMoebooruParser extends BasicMoebooruParser {
  // @Abstract
  getTagAttr() {
    throw { error: 'Direct call of an abstract method' };
  }
  tagGroupsExtractor(groupName, prefix, $) {
    let _tags = [];
    let _attr = this.getTagAttr();
    $(this.getClassTemplate().replace('%namespace%', groupName)).each(function (
      _i,
      el
    ) {
      if (el && el.attribs && el.attribs[_attr]) {
        _tags.push(prefix + el.attribs[_attr]);
      }
    });

    return _tags;
  }
}

module.exports = BasicMetaMoebooruParser;
