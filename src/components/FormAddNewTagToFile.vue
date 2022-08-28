<template>
  <!-- TODO: заменить на всплывающий диалог -->
  <v-text-field v-model="newTagTitle" label="New tag title" />
  <v-text-field v-model="newTagLocale" label="locale" />
  <v-btn icon="mdi-add" @click="addTagToCurrentFile()">Add</v-btn>
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
