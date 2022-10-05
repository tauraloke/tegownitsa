// eslint-disable-next-line no-unused-vars
import ParserResponse from '../parsers/parser_response.js';

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
    throw 'Realize abstract method isValid()!';
  }
  /**
   * @Abstract
   * @returns {object[]?}
   */
  getCandidates() {
    throw 'Realize abstract method getCandidates()!';
  }
  /**
   * @Abstract
   * @returns {object?}
   */
  getBestCandidate() {
    throw 'Realize abstract method getBestCandidate()!';
  }
  /**
   * @Abstract
   * @param {object} candidate
   * @returns {string?}
   */
  extractUrl() {
    throw 'Realize abstract method extractUrl()!';
  }
  /**
   * Null or item for extraction data from items instead source url.
   * @param {object} _candidate
   * @param {string} _resource_name
   * @returns {ParserResponse?}
   */
  extractParserResponse(_candidate, _resource_name) {
    return null;
  }
  /**
   * @param {object} _candidate
   * @param {string} _resource_name
   * @returns {object?}
   */
  extractMetadata(_candidate, _resource_name) {
    return null;
  }
}
