<template>
  <form id="tag_edit_form">
    <input v-model="newTagTitle" type="text" />
    <input v-model="newTagLocale" type="text" />
    <button @click="addTagToCurrentFile()">Add</button>
    {{ fileId
    }}<!-- TODO: remove -->
  </form>
</template>

<script>
export default {
  name: 'FormAddNewTagToFile',
  props: {
    fileId: {
      type: Number,
      required: true
    }
  },
  data() {
    return { newTagTitle: null, newTagLocale: null };
  },
  async mounted() {},
  unmounted() {},
  methods: {
    async addTagToCurrentFile() {
      // TODO
    }
  }
};
</script>

<style scoped></style>
