import BaseStrategy from './base_strategy.js';
import tagResources from '@/config/tag_resources.js';
import Job from '@/services/job.js';

export default class IqdbCatchFirstStrategy extends BaseStrategy {
  run({ file, jobList, candidatesList }) {
    let bestMatch = this.getBestCandidate(candidatesList);
    let resource = tagResources.find((r) =>
      bestMatch?.sourceUrl?.match(r.mask)
    );
    if (resource) {
      console.log(
        `Added job task for #${file.id} to resource ${resource.name}`
      );
      Job.addJobTask(
        jobList,
        resource.name,
        resource.locale,
        bestMatch.sourceUrl,
        file
      );
    }
  }
  // iqdb-client specific numeral order
  getBestCandidate(candidatesList) {
    return candidatesList?.[1];
  }
}
