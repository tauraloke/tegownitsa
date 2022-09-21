import BasicMoebooruParser from './basic_moebooru_parser.js';

// @Abstract
export default class BasicHTMLMoebooruParser extends BasicMoebooruParser {
  async tagGroupsExtractor(groupName, prefix) {
    let $ = await this.getHtmlParser();
    let _tags = [];
    $(this.getClassTemplate().replace('%namespace%', groupName)).each(function (
      _i,
      el
    ) {
      if (el) {
        _tags.push(prefix + $(el).text());
      }
    });
    return _tags;
  }
}
