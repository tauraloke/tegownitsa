<template>
  <section>
    <v-row class="justify-center">
      <v-btn v-if="predictedTags.length == 0" @click="predictTags()">
        {{ $t('button.predict_tags') }}
      </v-btn>
      <v-btn v-if="predictedTags.length > 0" @click="predictedTags = []">
        {{ $t('button.hide_predicted_tags') }}
      </v-btn>
    </v-row>
    <v-table v-if="predictedTags.length > 0" style="text-align: center">
      <template #default>
        <thead>
          <tr>
            <th class="text-center">Name</th>
            <th class="text-center">Score</th>
            <th class="text-center">Namespace</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in predictedTags" :key="item.name">
            <td>
              <span v-if="item.name.length < nameLimit">
                {{ item.name }}
              </span>
              <span v-else :title="item.name">
                {{ item.name.slice(0, nameLimit) }}...
              </span>
            </td>
            <td>{{ item.score_percent }}</td>
            <td>{{ item.namespace }}</td>
            <td>
              <v-icon v-if="item.in_tag_locales" icon="mdi-check" />
              <v-btn
                v-else
                icon="mdi-plus"
                :title="$t('button.add')"
                @click="addPredictedTag(item)"
              />
            </td>
          </tr>
        </tbody>
      </template>
    </v-table>
  </section>
</template>

<script>
import sourceTypes from '../config/source_type.json';
import tagNamespaces from '@/config/tag_namespaces.json';
import { swap } from '@/services/utils.js';
/** @type {Object<number, string>} */
const tagNameSpacesById = swap(tagNamespaces);

export default {
  name: 'PredictedTags',
  props: {
    currentFile: {
      type: Object,
      required: true
    },
    tags: {
      type: Object,
      required: true
    }
  },
  emits: ['after-add-tag', 'toast'],
  data() {
    return {
      predictedTags: [],
      nameLimit: 10
    };
  },
  methods: {
    tagLocales() {
      return this.tags
        .map((t) =>
          t.locales.map(
            (l) =>
              tagNameSpacesById[t.namespace_id].toLowerCase() + ':' + l.title
          )
        )
        .reduce((l, a) => [...a, ...l], []);
    },
    async predictTags() {
      if (!this.currentFile) {
        return false;
      }
      let autoTaggerResponse = await window.ocrApi.autotagger(
        this.currentFile.full_path
      );
      if (autoTaggerResponse.status != 'OK') {
        if (autoTaggerResponse.error == 'model_not_found') {
          this.$emit(
            'toast',
            this.$t('dialog_show_file.wait_for_neuronet_files')
          );
          window.network.downloadArchive(
            'Danbooru',
            autoTaggerResponse.url,
            autoTaggerResponse.destination
          );
          return false;
        }
        if (autoTaggerResponse.error == 'model_still_loading') {
          this.$emit(
            'toast',
            this.$t('dialog_show_file.neuronet_files_still_loading')
          );
        }
        return false;
      }
      console.log(this.tagLocales());
      const tagLocales = this.tagLocales();
      let items = autoTaggerResponse.result.map((t) => {
        let full_name =
          tagNameSpacesById[t.tag.namespace_id].toLowerCase() +
          ':' +
          t.tag.name;
        return {
          name: t.tag.name,
          namespace: this.$t(
            `tags.namespaces.${tagNameSpacesById[t.tag.namespace_id]}`
          ),
          full_name: full_name,
          score_percent: Math.floor(t.score * 100) + '%',
          in_tag_locales: !!tagLocales.find((l) => l == full_name)
        };
      });
      console.table(items);
      this.predictedTags = items;
    },
    async addPredictedTag(tag) {
      let newTagLocale = 'en';
      let savedTag = await window.sqliteApi.addTag(
        this.currentFile.id,
        tag.full_name,
        newTagLocale,
        sourceTypes.MANUAL
      );
      this.predictedTags = this.predictedTags.filter(
        (t) => t.full_name != tag.full_name
      );
      if (!savedTag) {
        return;
      }
      tag.in_tag_locales = true;
      this.$emit('after-add-tag', savedTag);
    }
  }
};
</script>

<style>
.clickable-i i {
  cursor: pointer !important;
}
</style>
