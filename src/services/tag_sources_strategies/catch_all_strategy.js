import BaseStrategy from './base_strategy.js';
import tagResources from '@/config/tag_resources.js';
import ParseTagResourceTask from '../tasks/parse_tag_resource_task.js';
// eslint-disable-next-line no-unused-vars
import TaskQueue from '../task_queue.js';
// eslint-disable-next-line no-unused-vars
import BaseResponseExtractor from '../response_extractor/base_response_extractor.js';

export default class CatchAllStrategy extends BaseStrategy {
  /**
   * @param {Object} arg
   * @param {Object} arg.file
   * @param {Object<string, TaskQueue>} arg.queueList
   * @param {BaseResponseExtractor} arg.apiResponse
   */
  run({ file, queueList, apiResponse }) {
    let items = apiResponse.getCandidates();
    console.log('request reverse results', items);
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let url = apiResponse.extractUrl(item);
      let resource = tagResources.find((r) => url?.match(r.mask));
      if (resource) {
        console.log(`Added task for #${file.id} to resource ${resource.name}`);
        let resourceTask = new ParseTagResourceTask({
          url,
          resource_name: resource.name,
          locale: resource.locale,
          file,
          noRemoteItem: apiResponse.extractParserResponse(item, resource.name)
        });
        queueList[resource.name].addTask(resourceTask);
      }
    }
    return true;
  }
}
