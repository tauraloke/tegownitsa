export default class ParserResponse {
  /**
   * @constructor
   * @param {Object} args
   * @param {string} args.requestedUrl saved url of a parser
   * @param {object[]?} args.tags collection of artwork' tags
   * @param {string?} args.fullSizeImageUrl link to a fullsize file
   * @param {object[]?} args.title title of an artwork
   * @param {string[]?} args.sourceUrls collection of next source links
   * @param {string[]?} args.authorUrls links to an author' galleries
   */
  constructor({
    requestedUrl,
    tags,
    fullSizeImageUrl,
    title,
    sourceUrls,
    authorUrls
  }) {
    /** @type {string} */
    this.requestedUrl = requestedUrl;
    /** @type {object[]?} */
    this.tags = tags;
    /** @type {string?} */
    this.fullSizeImageUrl = fullSizeImageUrl;
    /** @type {string?} */
    this.title = title;
    /** @type {string[]?} */
    this.sourceUrls = sourceUrls;
    /** @type {string} */
    this.authorUrls = authorUrls;
  }
}
