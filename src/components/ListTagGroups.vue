<template>
  <v-container>
    <div v-if="!tags || tags.length == 0" style="text-align: center">
      {{ $t('list.empty') }}
    </div>
    <v-sheet
      v-for="group in tagsGroupped(filteredTags(tags))"
      :key="group.id"
      elevation="3"
      rounded="xl"
      class="tags_namespace"
    >
      <h5 style="text-align: center">
        {{ $t(`tags.namespaces.${group.name}`) }}
      </h5>
      <div class="ma-4">
        <v-chip-group column class="justify-center">
          <v-chip
            v-for="tag in group.tags"
            :key="tag?.id"
            :ref="`tag_chip_${tag.id}`"
            draggable
            dropzone="move"
            :title="tag?.locales.map((l) => l.title)"
            :closable="isClosable(tag)"
            :data-tag-id="tag?.id"
            class="editable-tag-container"
            @click:close.stop="removeTagFromFile(tag)"
            @click="searchFilesByTag(tag)"
            @dragstart="chipDragStart($event, tag)"
            @dragenter="chipDragEnter($event)"
            @dragover.prevent="true"
            @drop="chipDrop"
          >
            <span class="text-truncate">
              {{ tag?.locales?.[0]?.title }}
            </span>
          </v-chip>
        </v-chip-group>
      </div>
    </v-sheet>
    <div v-if="filterBySource">
      <v-select
        v-model="sourceFilter"
        :items="tagSources()"
        :label="$t('tags.sources.label')"
        variant="solo"
        menu-icon="mdi-filter"
      />
    </div>
  </v-container>

  <v-snackbar v-model="isRestoreToastVisible">
    {{
      $t('toast.tag_unlinked_from_file', [tagToRestoring?.locales?.[0]?.title])
    }}
    <template #actions>
      <v-btn plain @click="restoreTag(tagToRestoring)">
        {{ $t('button.restore') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import tagNamespaces from '@/config/tag_namespaces.js';
import { swap } from '@/services/utils.js';
const tagNameSpacesById = swap(tagNamespaces);
import tagSources from '@/config/source_type.json';
const tagSourcesById = swap(tagSources);

export default {
  name: 'ListTagGroups',
  props: {
    tags: {
      type: Object,
      required: true
    },
    closableTags: {
      type: Boolean,
      default: false
    },
    filterBySource: {
      type: Boolean,
      default: false
    }
  },
  emits: { 'search-by-title': null, 'tag-added': null, 'tag-removed': null },
  data() {
    return {
      isRestoreToastVisible: false,
      tagToRestoring: null,
      sourceFilter: null
    };
  },
  methods: {
    chipDragStart($event, tag) {
      $event.dataTransfer.setData('text/plain', JSON.stringify(tag));
      let img = new Image();
      img.src = './dragging_tag.png';
      $event.dataTransfer.setDragImage(img, 0, 0);
    },
    chipDragEnter($event) {
      let element = $event.target;
      while (element.parentNode) {
        if (element.classList.contains('v-chip')) {
          element.classList.add('dragover');
          setTimeout(() => {
            element.classList.remove('dragover');
          }, 2000);
          break;
        }
        element = element.parentNode;
      }
    },
    async chipDrop($event) {
      let sourceTag = JSON.parse($event.dataTransfer.getData('text/plain'));
      let element = $event.toElement;
      let isClassFound = false;
      while (element.parentNode) {
        if (element.classList.contains('v-chip')) {
          isClassFound = true;
          break;
        }
        element = element.parentNode;
      }
      if (!isClassFound) {
        return false;
      }
      let targetTagId = $event.toElement.parentNode.getAttribute('data-tag-id');
      let classResult = (await window.sqliteApi.glueTags(
        sourceTag.id,
        targetTagId
      ))
        ? 'success_glued'
        : 'fail_to_glue';
      element.classList.add(classResult);
      setTimeout(() => {
        element.classList.remove(classResult);
        if (classResult == 'success_glued') {
          this.$emit('tag-removed', sourceTag);
        }
      }, 2000);
    },
    isClosable(tag) {
      return this.closableTags && !!tag.file_tag_id;
    },
    searchFilesByTag(tag) {
      this.$emit('search-by-title', tag);
    },
    removeTagFromFile(tag) {
      window.sqliteApi.unlinkTag(tag.file_tag_id);
      this.$emit('tag-removed', tag);
      this.isRestoreToastVisible = true;
      this.tagToRestoring = tag;
    },
    restoreTag(tag) {
      console.log('Restoring tag', tag);
      if (!tag.locales?.[0]?.title || !tag?.file_id) {
        return false;
      }
      window.sqliteApi.addTag(
        tag.file_id,
        tagNameSpacesById[tag.namespace_id].toLowerCase() +
          ':' +
          tag.locales?.[0]?.title,
        tag.locales?.[0]?.locale,
        tag.source_type
      );
      this.$emit('tag-added', tag);
      this.isRestoreToastVisible = false;
      this.tagToRestoring = null;
    },
    tagsGroupped(tags) {
      let groups = [];
      for (let i = 0; i < tags.length; i++) {
        let tag = tags[i];
        if (!groups[tag.namespace_id]) {
          groups[tag.namespace_id] = {
            name: tagNameSpacesById[tag.namespace_id],
            id: tag.namespace_id,
            tags: []
          };
        }
        groups[tag.namespace_id].tags.push(tag);
      }
      return Object.values(groups);
    },
    filteredTags() {
      if (this.sourceFilter === null) {
        return this.tags;
      }
      return this.tags.filter((t) => t.source_type === this.sourceFilter);
    },
    tagSources() {
      return [
        { value: null, title: this.$t('tags.sources.all') },
        ...this.tags
          .map((t) => t.source_type)
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((s) => {
            return { value: s, title: tagSourcesById[s] };
          })
      ];
    }
  }
};
</script>

<style scoped>
.v-chip {
  transition: all 1s ease-out;
}
.v-chip-group .dragover {
  background-color: gray;
  scale: 120%;
}
.v-chip-group .success_glued {
  background-color: green;
  scale: 120%;
}
.v-chip-group .fail_to_glue {
  background-color: green;
  scale: 120%;
}
</style>
