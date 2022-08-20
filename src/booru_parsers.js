const cheerio = require("cheerio");

class MoebooruParser {
	constructor(classTemplate, tagAttr = null) {
		this.classTemplate = classTemplate;
		this.tagAttr = tagAttr;
	}
	tagGroupsExtractor(groupName, prefix, $) {
		let _tags = [];
		let _attr = this.tagAttr;
		$(this.classTemplate.replace("%namespace%", groupName)).each(function (
			i,
			el
		) {
			if (el && el.attribs && el.attribs[_attr]) {
				_tags.push(prefix + el.attribs[_attr]);
			}
		});

		return _tags;
	}
	extractTags(buffer) {
		let $ = cheerio.load(buffer);
		let tags = [];
		tags.push(...this.tagGroupsExtractor("general", "", $));
		tags.push(...this.tagGroupsExtractor("artist", "creator:", $));
		tags.push(...this.tagGroupsExtractor("copyright", "series:", $));
		tags.push(...this.tagGroupsExtractor("character", "character:", $));
		tags.push(...this.tagGroupsExtractor("meta", "meta:", $));
		return tags;
	}
}

class YandereParser extends MoebooruParser {
	tagGroupsExtractor(groupName, prefix, $) {
		let _tags = [];
		$(
			this.classTemplate.replace("%namespace%", groupName) + " a:nth-of-type(2)"
		).each(function (i, el) {
			if (el) {
				_tags.push(prefix + $(el).text());
			}
		});
		return _tags;
	}
}

class GelbooruParser extends MoebooruParser {
	tagGroupsExtractor(groupName, prefix, $) {
		let _tags = [];
		$(
			this.classTemplate.replace("%namespace%", groupName) + " > a"
		).each(function (i, el) {
			if (el) {
				_tags.push(prefix + $(el).text());
			}
		});
		return _tags;
	}
}

module.exports = {
	MoebooruParser: MoebooruParser,
	YandereParser: YandereParser,
	GelbooruParser: GelbooruParser,
};
