<template>
  <v-container>
    <v-sheet
      v-for="group in tagsGroupped"
      :key="group.id"
      elevation="3"
      rounded="xl"
      class="tags_namespace"
    >
      <h5>{{ group.name }}</h5>
      <div class="ma-4">
        <v-chip-group column>
          <v-chip
            v-for="tag in group.tags"
            :key="tag?.id"
            :title="tag?.locales.map((l) => l.title)"
            :closable="isClosable(tag)"
            @click:close.stop="removeTagFromFile(tag.file_tag_id, tag.id)"
            @click="searchFilesByTag(tag?.locales?.[0]?.title)"
          >
            {{ tag?.locales?.[0]?.title }}
          </v-chip>
        </v-chip-group>
      </div>
    </v-sheet>
  </v-container>
</template>

<script>
export default {
  name: 'ListTagGroups',
  props: {
    tagsGroupped: {
      type: Object,
      required: true
    }
  },
  emits: { 'search-by-title': null },
  data() {
    return {
      searchCaption: null,
      searchTags: null,
      entries: [],
      isLoading: false,
      search: null
    };
  },
  methods: {
    isClosable(tag) {
      return !!tag.file_tag_id;
    },
    searchFilesByTag(title) {
      this.$emit('search-by-title', title);
    },
    editTag(_tag_id) {
      // TODO
    },
    removeTagFromFile(file_id, tag_id) {
      alert(file_id + '~' + tag_id);
      return false;
      // TODO
    }
  }
};
</script>

<style scoped></style>
