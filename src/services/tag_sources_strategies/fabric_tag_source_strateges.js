import tss from '../../config/tag_source_strategies.json';
import IqdbCatchFirstStrategy from './iqdb_catch_first_strategy.js';
import CatchAllStrategy from './catch_all_strategy.js';

export default class FabricJobTagSourceStrategy {
  static getStrategy({ key, engine }) {
    if (key == tss.CATCH_FIRST_ONE && engine == 'iqdb') {
      return new IqdbCatchFirstStrategy();
    }
    if (key == tss.CATCH_ALL) {
      return new CatchAllStrategy();
    }

    throw `Cannot find a strategy by a key '${key}'`;
  }
}
