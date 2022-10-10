<template>
  <v-dialog v-model="isTagNDiagloVisible">
    <v-card>
      <v-card-title style="text-align: center">
        {{ $t('dialog_tag_editor.update_tag') }}
        {{ tagLocales[0].title }}
      </v-card-title>
      <v-card-text style="text-align: center">
        <v-select
          v-model="namespaceId"
          :items="namespaceList"
          variant="outlined"
          persistent-hint
          single-line
          :hint="$t('dialog_tag_namespace.choose_namespace')"
        />
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="gray" @click="isTagNDiagloVisible = false">
          {{ $t('button.cancel') }}
        </v-btn>
        <v-btn color="green" @click="updateTag()">
          {{ $t('dialog_tag_editor.update_tag') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import tagNamespaces from '@/config/tag_namespaces.js';
import { sleep } from '@/services/utils.js';

export default {
  name: 'DialogTagNamespaceEditor',
  emits: ['tag-updated'],
  data() {
    return {
      tag: null,
      tagLocales: [],
      isTagNDiagloVisible: false,
      namespaceId: null,
      namespaceList: []
    };
  },
  mounted() {
    sleep(1000).then(() => {
      this.namespaceList = Object.keys(tagNamespaces).map((key) => {
        return {
          title: this.$t(`tags.namespaces.${key}`),
          value: tagNamespaces[key]
        };
      });
    });
  },
  methods: {
    async showComponent(tag_id) {
      if (!tag_id) {
        return false;
      }
      this.tag = await window.sqliteApi.getTag(tag_id);
      this.namespaceId = this.tag.namespace_id;
      this.tagLocales = await window.sqliteApi.getTagLocales(tag_id);
      if (!this.tag) {
        return false;
      }
      this.isTagNDiagloVisible = true;
    },
    hideComponent() {
      this.isTagNDiagloVisible = false;
    },
    async updateTag() {
      await window.sqliteApi.updateTagNamespace({
        tag_id: this.tag.id,
        namespace_id: this.namespaceId
      });
      this.isTagNDiagloVisible = false;
      this.$emit('tag-updated', {
        tag_id: this.tag.id,
        namespace_id: this.namespaceId
      });
    }
  }
};
</script>

<style></style>
