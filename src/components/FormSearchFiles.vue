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
        item-value="title"
        label="Find by tags: print and choose"
        prepend-icon="mdi-database-search"
        return-object
        chips
        closable-chips
        multiple
        clearable
      ></v-autocomplete>
    </v-row>
    <v-row>
      <v-text-field
        v-model="searchCaption"
        label="Find by caption: print and enter"
        clearable
        @change="$emit('by-caption', $event?.target?.value)"
      ></v-text-field>
    </v-row>
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
