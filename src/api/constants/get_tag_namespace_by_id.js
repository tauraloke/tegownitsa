const tagNamespaces = require('../../tag_namespaces.json');
const { swap } = require('../../services/utils.js');

module.exports = {
  run: async (_event, _db, id) => {
    let hash = swap(tagNamespaces);
    return hash[id];
  }
};
