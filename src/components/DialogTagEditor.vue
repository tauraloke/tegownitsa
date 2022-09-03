<template>
  <v-dialog v-model="isDialogVisible" scrollable>
    <v-card v-if="tag">
      <v-toolbar>
        <v-toolbar-title> Edit tag #{{ tag?.id }} </v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon="mdi-close" title="Go back" @click="hideComponent()" />
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-row class="justify-center">
          Tag is linked to {{ tag.file_count }} files.
        </v-row>
        <v-row
          v-for="(locale, index) in tagLocales"
          :key="locale.id"
          class="ma-8"
        >
          <v-text-field v-model="tagLocales[index].title" hint="title" />
          <v-text-field v-model="tagLocales[index].locale" hint="locale" />
          <v-btn
            v-if="tagLocales?.length > 1"
            icon="mdi-close"
            class="ma-2"
            title="Remove locale"
            @click="tagLocales = tagLocales.filter((_, i) => i != index)"
          />
        </v-row>
        <v-row class="ma-8 justify-center">
          <v-btn @click="tagLocales.push({ title: '', locale: 'en' })">
            Add a new row
          </v-btn>
          <v-btn
            :disabled="tagLocales.map((t) => t.title).join('') == ''"
            color="success ml-10"
            @click="updateTag()"
          >
            Update the tag
          </v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'DialogTagEditor',
  emits: ['tag-updated'],
  data() {
    return {
      isDialogVisible: false,
      tag: null,
      tagLocales: []
    };
  },
  methods: {
    async showComponent(tag_id) {
      if (!tag_id) {
        return false;
      }
      this.tag = await window.sqliteApi.getTag(tag_id);
      this.tagLocales = await window.sqliteApi.getTagLocales(tag_id);
      if (!this.tag) {
        return false;
      }
      this.isDialogVisible = true;
    },
    hideComponent() {
      this.isDialogVisible = false;
    },
    async updateTag() {
      let newTagLocales = this.tagLocales.map((t) => {
        return { title: t.title, locale: t.locale };
      });
      await window.sqliteApi.replaceTagLocales(this.tag?.id, newTagLocales);
      this.$emit('tag-updated', {
        tagId: this.tag.id,
        newLocales: newTagLocales
      });
      this.isDialogVisible = false;
    }
  }
};
</script>

<style></style>
