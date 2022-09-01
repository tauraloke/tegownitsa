import tagNamespaces from '@/config/tag_namespaces.json';
import { swap } from '@/services/utils.js';
const tagNameSpacesById = swap(tagNamespaces);

export default {
  methods: {
    tagsGroupped(tags) {
      let groups = [];
      for (let i = 0; i < tags.length; i++) {
        let tag = tags[i];
        if (!groups[tag.namespace_id]) {
          groups[tag.namespace_id] = {
            name: tagNameSpacesById[tag.namespace_id],
            id: tag.namespace_id,
            tags: []
          };
        }
        groups[tag.namespace_id].tags.push(tag);
      }
      return Object.values(groups);
    }
  }
};
