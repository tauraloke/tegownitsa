export default class BaseResponseExtractor {
  /**
   *
   * @param {object} response
   * @param {number} similarityThreshold
   */
  constructor(response, similarityThreshold) {
    this.response = response;
    this.similarityThreshold = similarityThreshold;
  }
  /**
   * @Abstract
   * @returns {boolean}
   */
  isValid() {
    throw 'Realize abstract method!';
  }
  /**
   * @Abstract
   * @returns {object[]?}
   */
  getCandidates() {
    throw 'Realize abstract method!';
  }
  /**
   * @Abstract
   * @returns {object?}
   */
  getBestCandidate() {
    throw 'Realize abstract method!';
  }
  /**
   * @Abstract
   * @param {object} candidate
   * @returns {string?}
   */
  extractUrl() {
    throw 'Realize abstract method!';
  }
}
