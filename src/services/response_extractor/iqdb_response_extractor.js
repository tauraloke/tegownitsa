import BaseResponseExtractor from './base_response_extractor.js';

export default class IqdbResponseExtractor extends BaseResponseExtractor {
  /**
   * @returns {boolean}
   */
  isValid() {
    return this.response.ok && this.response?.data?.length > 0;
  }
  /**
   * @returns {object[]?}
   */
  getCandidates() {
    return (
      this.candidates ||
      this.response.data?.filter(
        (b) => b?.similarity > this.similarityThreshold
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
    return candidate?.sourceUrl;
  }
}
