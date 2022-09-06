import BaseStrategy from './base_strategy.js';
import tagResources from '@/config/tag_resources.js';
import ParseTagResourceTask from '../tasks/parse_tag_resource_task.js';
// eslint-disable-next-line no-unused-vars
import TaskQueue from '../task_queue';

export default class CatchAllStrategy extends BaseStrategy {
  /**
   * @param {Object} arg
   * @param {Object} arg.file
   * @param {Object<string, TaskQueue>} arg.queueList
   * @param {Object[]} arg.candidatesList
   */
  run({ file, queueList, candidatesList }) {
    for (let i = 0; i < candidatesList.length; i++) {
      let match = candidatesList[i];
      let resource = tagResources.find((r) => match?.sourceUrl?.match(r.mask));
      if (resource) {
        console.log(`Added task for #${file.id} to resource ${resource.name}`);
        let resourceTask = new ParseTagResourceTask({
          url: match.sourceUrl,
          resource_name: resource.name,
          locale: resource.locale,
          file
        });
        queueList[resource.name].addTask(resourceTask);
      }
    }
  }
}
