<template>
  <v-container>
    <v-row>
      <v-autocomplete
        v-model="searchTags"
        v-model:search="search"
        :loading="isLoading"
        :items="entries"
        hide-no-data
        hide-selected
        item-title="title"
        item-value="value"
        :label="$t('form_search_files.find_by_tags_print_and_choose')"
        prepend-icon="mdi-database-search"
        return-object
        chips
        closable-chips
        multiple
        clearable
      />
    </v-row>
  </v-container>
</template>

<script>
import tagNamespaces from '../config/tag_namespaces.js';
import hardConditionParsers from '../services/file_condition_pair_parser.js';

const namespaces = Object.keys(tagNamespaces).map((n) => n.toLowerCase());
const pseudoNameSpaces = Object.keys(hardConditionParsers);

export default {
  name: 'FormSearchFiles',
  emits: ['by-tags'],
  data() {
    return {
      searchTags: null,
      entries: [],
      isLoading: false,
      search: null
    };
  },
  watch: {
    /**
     * @param {string} head
     */
    search(head) {
      if (!head) {
        return;
      }

      // Items have already been requested
      if (this.isLoading) return;

      this.isLoading = true;

      let namespace = null;

      if (head.includes(':')) {
        namespace = head.split(':')[0];
        if (pseudoNameSpaces.includes(namespace)) {
          this.entries = [{ title: head, value: head }];
          this.count = 1;
          this.isLoading = false;
          return;
        }
        if (!namespaces.includes(namespace)) {
          namespace = null;
        } else {
          head = head.split(':')[1];
        }
      }

      window.sqliteApi
        .findTagsByHead(head, namespace)
        .then((tags) => {
          this.entries = tags;
          this.count = tags.length;
          this.isLoading = false;
        })
        .catch((error) =>
          console.log('Cannot load autocomplete for tags', error)
        )
        .finally(() => {
          this.isLoading = false;
        });
    },
    searchTags(tags) {
      this.$emit('by-tags', tags.map((t) => t?.title).join(','));
    }
  },
  methods: {
    reset(newValue) {
      this.search = null;
      this.searchTags = [{ title: newValue }];
    }
  }
};
</script>

<style scoped></style>
