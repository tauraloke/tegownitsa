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
            @click="searchFilesByTag(tag?.locales?.[0]?.title)"
          >
            {{ tag?.locales?.[0]?.title }}
            <v-btn
              class="ma-2"
              title="Edit the tag"
              outlined
              size="x-small"
              color="info"
              fab
              icon="mdi-pencil"
              @click="editTag(tag?.id)"
            />
            <v-btn
              class="ma-2"
              title="Edit the tag"
              outlined
              size="x-small"
              color="secondary"
              fab
              icon="mdi-delete"
              @click="removeTagFromFile(tag?.file_tag_id)"
            />
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
  emits: { 'by-tags': null, 'by-caption': null },
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
    searchFilesByTag(title) {
      console.log(title);
      // TODO
    },
    editTag(_tag_id) {
      // TODO
    },
    removeTagFromFile(_file_tag_id) {
      // TODO
    }
  }
};
</script>

<style scoped></style>
