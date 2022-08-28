<template>
  <v-container>
    <v-autocomplete
      v-model="searchTags"
      v-model:search="search"
      :loading="isLoading"
      :items="entries"
      hide-no-data
      hide-selected
      item-title="title"
      item-value="title"
      label="Find"
      prepend-icon="mdi-database-search"
      return-object
      chips
      closable-chips
      multiple
    ></v-autocomplete>
    <v-btn @click="$emit('by-tags', searchTags.map((t) => t?.title).join(','))"
      >by tags</v-btn
    >
    <v-btn @click="$emit('by-caption', searchCaption)">by captions</v-btn>
    {{ searchTags }}
  </v-container>
</template>

<script>
export default {
  name: 'FormSearchFiles',
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
  watch: {
    search(head) {
      // Items have already been requested
      if (this.isLoading) return;

      this.isLoading = true;

      window.sqliteApi
        .findTagsByHead(head)
        .then((tags) => {
          this.entries = tags;
          this.count = tags.length;
          this.isLoading = false;
        })
        .catch((error) =>
          console.log('Cannot load autocomplete for tags', error)
        )
        .finally(() => {
          console.log('call finally');
          this.isLoading = false;
        });
    },
    searchTags(tags) {
      this.$emit('by-tags', tags.map((t) => t?.title).join(','));
    }
  }
};
</script>

<style scoped></style>
