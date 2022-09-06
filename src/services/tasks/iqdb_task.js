// frontend class

import BaseTask from './base_task.js';
// eslint-disable-next-line no-unused-vars
import BaseStrategy from '../tag_sources_strategies/base_strategy.js';

export default class IqdbTask extends BaseTask {
  async run() {
    let file = this.options.file;
    let iqdb_threshold = this.options.iqdb_threshold;
    /** @type BaseStrategy */
    let strategy = this.options.strategy;
    let task_queues = this.options.task_queues;

    console.log(`Looking #${file.id} ${file['preview_path']} at IQDB`);

    let response = await window.network.lookupIqdbFile(file['preview_path']);
    if (response.ok && response?.data?.length > 0) {
      let candidatesList = response.data?.filter(
        (b) => b?.similarity > iqdb_threshold
      );
      strategy.run({
        file,
        queueList: task_queues,
        candidatesList: candidatesList
      });
    }

    this.incrementJobProgress(1);
  }
}
