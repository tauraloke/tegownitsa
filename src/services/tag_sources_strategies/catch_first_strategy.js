import BaseStrategy from './base_strategy.js';
import tagResources from '@/config/tag_resources.js';
import ParseTagResourceTask from '../tasks/parse_tag_resource_task.js';
// eslint-disable-next-line no-unused-vars
import TaskQueue from '../task_queue.js';
// eslint-disable-next-line no-unused-vars
import BaseResponseExtractor from '../response_extractor/base_response_extractor.js';

export default class CatchFirstStrategy extends BaseStrategy {
  /**
   * @param {Object} arg
   * @param {Object} arg.file
   * @param {Object<string, TaskQueue>} arg.queueList
   * @param {BaseResponseExtractor} arg.apiResponse
   */
  run({ file, queueList, apiResponse }) {
    let bestMatch = apiResponse.getBestCandidate();
    let url = apiResponse.extractUrl(bestMatch);
    if (!bestMatch || !url) {
      return false;
    }
    let resource = tagResources.find((r) => url.match(r.mask));
    if (!resource) {
      return false;
    }
    console.log(`Added task for #${file.id} to resource ${resource.name}`);
    let resourceTask = new ParseTagResourceTask({
      url,
      resource_name: resource.name,
      locale: resource.locale,
      file,
      noRemoteItem: apiResponse.extractParserResponse(bestMatch, resource.name),
      metadata: apiResponse.extractMetadata(bestMatch, resource.name),
      onAfterDataAdded: this.onAfterDataAdded
    });
    queueList[resource.name].addTask(resourceTask);
    return true;
  }
}
