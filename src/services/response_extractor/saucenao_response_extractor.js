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
}
