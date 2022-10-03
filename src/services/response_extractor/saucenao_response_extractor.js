import ParserResponse from '../parsers/parser_response.js';
import BaseResponseExtractor from './base_response_extractor.js';

export default class SaucenaoResponseExtractor extends BaseResponseExtractor {
  /**
   * @returns {boolean}
   */
  isValid() {
    return this.response?.results?.length > 0;
  }
  /**
   * @returns {object[]?}
   */
  getCandidates() {
    return (
      this.candidates ||
      this.response.results?.filter(
        (b) => b?.header?.similarity > this.similarityThreshold
      )
    );
  }
  /**
   * @returns {object?}
   */
  getBestCandidate() {
    return this.getCandidates()?.[0];
  }
  /**
   * @param {object} candidate
   * @returns {string?}
   */
  extractUrl(candidate) {
    return candidate?.data?.ext_urls?.[0];
  }
  /**
   * @param {object} candidate
   * @param {string} resource_name
   * @returns {ParserResponse?}
   */
  extractParserResponse(candidate, resource_name) {
    if (resource_name == 'twitter') {
      const author_name = candidate?.data?.twitter_user_handle;
      return new ParserResponse({
        requestedUrl: this.extractUrl(candidate),
        tags: author_name ? [`creator:${author_name}`] : [],
        fullSizeImage: null,
        title: null,
        sourceUrls: null,
        authorUrls: author_name ? [`https://twitter.com/${author_name}`] : null
      });
    }
    return null;
  }
}
