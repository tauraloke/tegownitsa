<template>
  <v-text-field
    v-model="newTagTitle"
    solo
    label="Type a tag title to add a new one"
  />
  <v-text-field v-if="newTagTitle" v-model="newTagLocale" solo label="locale" />
  <v-btn
    v-if="newTagLocale && newTagTitle"
    :disabled="!newTagTitle"
    color="success"
    width="100%"
    @click="addTagToCurrentFile()"
    >Add</v-btn
  >
</template>

<script>
import sourceTypes from '../config/source_type.json';

export default {
  name: 'FormAddNewTagToFile',
  props: {
    fileId: {
      type: Number,
      required: true
    }
  },
  emits: { 'after-add-tag': null },
  data() {
    return { newTagTitle: null, newTagLocale: 'en' };
  },
  methods: {
    async addTagToCurrentFile() {
      if (!this.newTagTitle) {
        return;
      }
      if (!this.newTagLocale) {
        this.newTagLocale = 'en';
      }
      let tag = await window.sqliteApi.addTag(
        this.fileId,
        this.newTagTitle,
        this.newTagLocale,
        sourceTypes.MANUAL
      );
      this.$emit('after-add-tag', tag);
      this.newTagTitle = null;
      this.newTagLocale = null;
    }
  }
};
</script>

<style scoped></style>
