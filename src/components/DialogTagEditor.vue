<template>
  <v-dialog v-model="isDialogVisible" scrollable>
    <v-card v-if="tag">
      <v-toolbar>
        <v-toolbar-title>
          {{ $t('dialog_tag_editor.edit_tag_x', [tag?.id]) }}
        </v-toolbar-title>
        <v-toolbar-items>
          <v-btn
            icon="mdi-close"
            :title="$t('button.back')"
            @click="hideComponent()"
          />
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-row class="justify-center">
          {{ $t('dialog_tag_editor.tag_linked_to_x_files', tag.file_count) }}
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
            :title="$t('dialog_tag_editor.remove_locale')"
            @click="tagLocales = tagLocales.filter((_, i) => i != index)"
          />
        </v-row>
      </v-card-text>
      <v-card-actions class="ma-8 justify-center">
        <v-btn @click="tagLocales.push({ title: '', locale: 'en' })">
          {{ $t('dialog_tag_editor.add_new_row') }}
        </v-btn>
        <v-btn
          :disabled="tagLocales.map((t) => t.title).join('') == ''"
          color="warning"
          @click="isTagRemovingInEditor = true"
        >
          {{ $t('dialog_tag_editor.remove_tag') }}
        </v-btn>
        <v-btn
          :disabled="tagLocales.map((t) => t.title).join('') == ''"
          color="success"
          @click="updateTag()"
        >
          {{ $t('dialog_tag_editor.update_tag') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="isTagRemovingInEditor">
    <v-card>
      <v-card-title style="text-align: center">
        {{ $t('dialog_tag_editor.remove_tag') }}
      </v-card-title>
      <v-card-text style="text-align: center">
        {{ $t('dialog_tag_editor.confirm_removing') }}
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="green" @click="isTagRemovingInEditor = false">
          {{ $t('button.cancel') }}
        </v-btn>
        <v-btn color="warning" @click="removeTag()">
          {{ $t('dialog_tag_editor.remove_tag') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'DialogTagEditor',
  emits: ['tag-updated', 'tag-removed', 'error'],
  data() {
    return {
      isDialogVisible: false,
      tag: null,
      tagLocales: [],
      isTagRemovingInEditor: false
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
      this.isTagRemovingInEditor = false;
    },
    hideComponent() {
      this.isDialogVisible = false;
      this.isTagRemovingInEditor = false;
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
    },
    async removeTag() {
      if (await window.sqliteApi.removeTag(this.tag?.id)) {
        this.hideComponent();
        this.$emit('tag-removed', this.tag);
      } else {
        this.$emit('error', this.$t('dialog_tag_editor.wrong_tag_removing'));
        this.isTagRemovingInEditor = false;
      }
    }
  }
};
</script>

<style></style>
