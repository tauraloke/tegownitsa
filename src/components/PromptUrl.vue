<template>
  <div id="url_container">
    <form id="url_prompt_form">
      <input
        v-model="url"
        type="text"
        placeholder="https://site.ltd/image.jpg"
      />
    </form>
    <button @click="sendUrlFromPrompt()">Download</button>
  </div>
</template>

<script>
export default {
  name: 'PromptUrl',
  emits: { 'send-url': null },
  data() {
    return { url: '' };
  },
  methods: {
    async sendUrlFromPrompt() {
      this.$emit('send-url', this.url);
      this.url = null;
    }
  }
};
</script>

<style scoped></style>
