import tss from '../../config/tag_source_strategies.json';
// eslint-disable-next-line no-unused-vars
import BaseStrategy from './base_strategy.js';
import CatchFirstStrategy from './catch_first_strategy.js';
import CatchAllStrategy from './catch_all_strategy.js';

/**
 * @param {object} arg
 * @param {string} arg.key
 * @param {()=>{}} arg.onAfterTagsAdded
 * @returns {BaseStrategy}
 */
export default function getStrategy({ key, onAfterTagsAdded }) {
  let className = {
    [tss.CATCH_FIRST_ONE]: CatchFirstStrategy,
    [tss.CATCH_ALL]: CatchAllStrategy
  }[key];
  if (!className) {
    throw `Cannot find a strategy by a key '${key}'`;
  }
  return new className({ onAfterTagsAdded });
}
