/**
 * @typedef {Object} ResponseImage
 * @property {string} url
 * @property {number} width
 * @property {number} height
 */

export default class ParserResponse {
  /**
   * @constructor
   * @param {Object} args
   * @param {string} args.requestedUrl saved url of a parser
   * @param {object[]?} args.tags collection of artwork' tags
   * @param {ResponseImage?} args.fullSizeImage link to a fullsize file
   * @param {object[]?} args.title title of an artwork
   * @param {string[]?} args.sourceUrls collection of next source links
   * @param {string[]?} args.authorUrls links to an author' galleries
   * @param {boolean} args.isSafeForWork mark SFW/NSFW images
   */
  constructor({
    requestedUrl,
    tags,
    fullSizeImage,
    title,
    sourceUrls,
    authorUrls,
    isSafeForWork
  }) {
    /** @type {string} */
    this.requestedUrl = requestedUrl;
    /** @type {object[]?} */
    this.tags = tags;
    /** @type {ResponseImage?} */
    this.fullSizeImage = fullSizeImage;
    /** @type {string?} */
    this.title = title;
    /** @type {string[]?} */
    this.sourceUrls = sourceUrls;
    /** @type {string} */
    this.authorUrls = authorUrls;
    /** @type {boolean} */
    this.isSafeForWork = isSafeForWork;
  }
}
