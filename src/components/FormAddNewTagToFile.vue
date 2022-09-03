<template>
  <v-combobox
    v-model="newTagTitle"
    v-model:search="newTagTitleSearch"
    :items="tagEntries"
    clearable
    :label="$t('form_add_new_tag_to_file.type_tag_title')"
  />
  <v-text-field v-if="newTagTitle" v-model="newTagLocale" solo label="locale" />
  <v-btn
    v-if="newTagLocale && newTagTitle"
    :disabled="!newTagTitle"
    color="success"
    width="100%"
    @click="addTagToCurrentFile()"
  >
    {{ $t('button.add') }}
  </v-btn>
</template>

<script>
import sourceTypes from '../config/source_type.json';
import tagNamespaces from '@/config/tag_namespaces.json';
import { swap } from '@/services/utils.js';
const tagNameSpacesById = swap(tagNamespaces);

export default {
  name: 'FormAddNewTagToFile',
  props: {
    fileId: {
      type: Number,
      required: true
    },
    tags: {
      type: Array,
      default: () => {
        [];
      }
    }
  },
  emits: { 'after-add-tag': null },
  data() {
    return {
      newTagTitle: null,
      newTagLocale: 'en',
      tagEntries: [],
      newTagTitleSearch: null
    };
  },
  watch: {
    newTagTitle: function (value) {
      window.sqliteApi.findTagsByHead(value).then((tags) => {
        let result = tags;
        if (this.tags?.length) {
          result = result.filter(
            (t1) => !this.tags.find((t2) => t1?.id == t2?.id)
          );
        }
        result = result.map((t) => {
          return (
            (t.namespace_id == 0
              ? ''
              : tagNameSpacesById[t.namespace_id].toLowerCase() + ':') + t.title
          );
        });
        this.tagEntries = result;
      });
    }
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
      this.newTagTitleSearch = null;
      this.tagEntries = [];
    }
  }
};
</script>

<style scoped></style>
