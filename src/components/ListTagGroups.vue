<template>
  <v-container>
    <v-sheet
      v-for="group in tagsGroupped(tags)"
      :key="group.id"
      elevation="3"
      rounded="xl"
      class="tags_namespace"
    >
      <h5 style="text-align: center">{{ group.name }}</h5>
      <div class="ma-4">
        <v-chip-group column>
          <v-chip
            v-for="tag in group.tags"
            :key="tag?.id"
            :title="tag?.locales.map((l) => l.title)"
            :closable="isClosable(tag)"
            :data-tag-id="tag?.id"
            class="editable-tag-container"
            @click:close.stop="removeTagFromFile(tag)"
            @click="searchFilesByTag(tag?.locales?.[0]?.title)"
          >
            <span class="text-truncate">
              {{ tag?.locales?.[0]?.title }}
            </span>
          </v-chip>
        </v-chip-group>
      </div>
    </v-sheet>
  </v-container>

  <v-snackbar v-model="isRestoreToastVisible">
    {{
      $t('toast.tag_unlinked_from_file', [tagToRestoring?.locales?.[0]?.title])
    }}
    <template #actions>
      <v-btn plain @click="restoreTag(tagToRestoring)">
        {{ $t('button.restore') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import tagNamespaces from '@/config/tag_namespaces.json';
import { swap } from '@/services/utils.js';
const tagNameSpacesById = swap(tagNamespaces);

export default {
  name: 'ListTagGroups',
  props: {
    tags: {
      type: Object,
      required: true
    }
  },
  emits: { 'search-by-title': null, 'tag-added': null },
  data() {
    return {
      searchCaption: null,
      searchTags: null,
      isLoading: false,
      search: null,
      isRestoreToastVisible: false,
      tagToRestoring: null
    };
  },
  methods: {
    isClosable(tag) {
      return !!tag.file_tag_id;
    },
    searchFilesByTag(title) {
      this.$emit('search-by-title', title);
    },
    removeTagFromFile(tag) {
      window.sqliteApi.unlinkTag(tag.file_tag_id);
      this.isRestoreToastVisible = true;
      this.tagToRestoring = tag;
    },
    restoreTag(tag) {
      console.log('Restoring tag', tag);
      if (!tag.locales?.[0]?.title || !tag?.file_id) {
        return false;
      }
      window.sqliteApi.addTag(
        tag.file_id,
        tagNameSpacesById[tag.namespace_id].toLowerCase() +
          ':' +
          tag.locales?.[0]?.title,
        tag.locales?.[0]?.locale,
        tag.source_type
      );
      this.$emit('tag-added', tag);
      this.isRestoreToastVisible = false;
      this.tagToRestoring = null;
    },
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
</script>

<style scoped></style>
