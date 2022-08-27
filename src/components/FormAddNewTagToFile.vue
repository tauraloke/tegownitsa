<template>
  <form id="tag_edit_form" @submit="addTagToCurrentFile()">
    <input v-model="newTagTitle" type="text" />
    <input v-model="newTagLocale" type="text" />
    <button @click="addTagToCurrentFile()">Add</button>
  </form>
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
    return { newTagTitle: null, newTagLocale: null };
  },
  async mounted() {},
  unmounted() {},
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
