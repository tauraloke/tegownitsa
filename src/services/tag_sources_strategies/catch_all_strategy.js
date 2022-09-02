import BaseStrategy from './base_strategy.js';
import tagResources from '@/config/tag_resources.js';
import TaskQueue from '@/services/task_queue.js';

export default class CatchAllStrategy extends BaseStrategy {
  run({ file, jobList, candidatesList }) {
    for (let i = 0; i < candidatesList.length; i++) {
      let match = candidatesList[i];
      let resource = tagResources.find((r) => match?.sourceUrl?.match(r.mask));
      if (resource) {
        console.log(`Added task for #${file.id} to resource ${resource.name}`);
        TaskQueue.addJobTask(
          jobList,
          resource.name,
          resource.locale,
          match.sourceUrl,
          file
        );
      }
    }
  }
}
