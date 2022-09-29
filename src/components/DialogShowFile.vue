<template>
  <v-dialog v-model="isDialogVisible" fullscreen scrollable>
    <v-card v-if="currentFile">
      <v-toolbar>
        <v-toolbar-title>
          {{ currentFile.source_filename }}
        </v-toolbar-title>
        <v-toolbar-items>
          <v-btn
            v-if="currentFile.prev"
            icon="mdi-arrow-expand-left"
            :title="$t('button.previous')"
            @click="goPrev()"
          />
          <v-btn
            v-if="currentFile.next"
            icon="mdi-arrow-expand-right"
            :title="$t('button.next')"
            @click="goNext()"
          />
          <v-btn
            icon="mdi-close"
            :title="$t('button.back')"
            @click="hideComponent()"
          />
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="4"
            class="pb-10"
            style="overflow-y: scroll; max-height: 99vh"
          >
            <h3 style="text-align: center" class="mb-4">
              {{ $t('main_window.tags') }}
            </h3>
            <form-add-new-tag-to-file
              v-if="currentFile"
              :file-id="currentFile?.id"
              :tags="tags"
              @after-add-tag="afterAddTagHandler($event)"
            />
            <predicted-tags
              ref="predicted_tags"
              :current-file="currentFile"
              :tags="tags"
              class="mb-6"
              @after-add-tag="afterAddTagHandler($event)"
              @toast="$emit('toast', $event)"
            />
            <list-tag-groups
              :tags="tags"
              closable-tags
              @search-by-title="
                $emit('search-by-tag', $event);
                hideComponent();
              "
              @tag-added="tags.push($event)"
              @tag-removed="
                $emit('tag-removed', $event);
                tags = tags.filter((t) => t.id != $event?.id);
              "
            />
          </v-col>
          <v-col cols="12" md="8">
            <div id="file_info_img_container">
              <v-img
                id="file_info_img"
                contain
                aspect-ratio="1"
                height="75vh"
                :src="'file://' + currentFile.full_path"
              />
            </div>

            <v-card elevation="4" class="ma-2 pa-8">
              <h5>{{ $t('dialog_show_file.size_parameters') }}</h5>
              <div>
                <b>{{ $t('image.width') }}:</b> {{ currentFile.width }}
                <b>{{ $t('image.height') }}:</b> {{ currentFile.height }}
              </div>
              <div v-if="fullsizes && fullsizes.length > 0">
                <h5>{{ $t('dialog_show_file.fullsizes') }}</h5>
                <ul>
                  <li v-for="row in fullsizes" :key="row.url">
                    <a :href="row.url" :title="row.url" target="_blank">
                      &lt; [{{ row.width }}x{{ row.height }}] &gt;
                    </a>
                    <a href="#" @click="improveFile(row.url)">
                      [{{ $t('dialog_show_file.improve_file') }}]
                    </a>
                  </li>
                </ul>
              </div>
            </v-card>

            <v-card
              v-if="exifExists"
              id="file_info_exif"
              elevation="4"
              class="ma-2 pa-4"
            >
              <h4>{{ $t('dialog_show_file.exif_data') }}</h4>
              <div v-if="currentFileDateCreated">
                {{ $t('dialog_show_file.create_data') }}:
                {{ currentFileDateCreated }}
              </div>
              <div v-if="currentFileCoords">
                {{ $t('dialog_show_file.coordinates') }}:
                <a
                  :href="
                    'https://www.google.com/maps/place/' + currentFileCoords
                  "
                  target="_blank"
                >
                  {{ currentFileCoords }}
                </a>
              </div>
              <div v-if="currentFileModel">
                {{ $t('dialog_show_file.maked_by') }}: {{ currentFileModel }}
              </div>
            </v-card>
            <v-card elevation="4" class="ma-2 clickable-i">
              <v-textarea
                v-model="currentFile.caption"
                :label="$t('dialog_show_file.recognized_text_on_image')"
                :title="$t('dialog_show_file.click_to_floppy_to_save_changes')"
                class="clickable-i"
                :append-inner-icon="fileCaptionTextareaIcon"
                @click:control="clickedOnCaptionTextarea($event)"
                @update:model-value="
                  fileCaptionTextareaIcon = 'mdi-content-save-edit'
                "
              ></v-textarea>
            </v-card>
            <div v-if="urls && urls.length > 0">
              <v-card elevation="4" class="ma-2 pa-8">
                <h5>{{ $t('dialog_show_file.sources') }}</h5>
                <ul>
                  <li v-for="row in urls" :key="row.url">
                    <a :href="row.url" target="_blank">
                      &lt; {{ row.title || row.url }} &gt;
                    </a>
                  </li>
                </ul>
              </v-card>
            </div>

            <div v-if="authorUrls && authorUrls.length > 0">
              <v-card elevation="4" class="ma-2 pa-8">
                <h5>{{ $t('main_window.author_urls') }}</h5>
                <ul>
                  <li v-for="row in authorUrls" :key="row.url">
                    <a :href="row.url" target="_blank">
                      &lt; {{ row.url }} &gt;
                    </a>
                  </li>
                </ul>
              </v-card>
            </div>

            <div v-if="polleeFileSources && polleeFileSources.length > 0">
              <v-card elevation="4" class="ma-2 pa-8">
                <h5>{{ $t('main_window.pollee_file_sources') }}</h5>
                <ul>
                  <li v-for="row in polleeFileSources" :key="row.id">
                    {{ sourceTypesById[row.source] }}
                    [{{ row.created_at }}]
                    <a
                      href="#"
                      :title="$t('button.remove')"
                      @click="removePolleeFileSource(row.id)"
                    >
                      [x]
                    </a>
                  </li>
                </ul>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import FormAddNewTagToFile from '@/components/FormAddNewTagToFile.vue';
import ListTagGroups from '@/components/ListTagGroups.vue';
import PredictedTags from '@/components/PredictedTags.vue';
import tagNamespaces from '@/config/tag_namespaces.js';
import sourceTypes from '@/config/source_type.json';
import { swap } from '@/services/utils.js';

export default {
  name: 'DialogShowFile',
  components: { FormAddNewTagToFile, ListTagGroups, PredictedTags },
  emits: ['search-by-tag', 'toast', 'added-tag', 'tag-removed'],
  data() {
    return {
      isDialogVisible: false,
      tags: [],
      urls: [],
      currentFile: null,
      fileCaptionTextareaIcon: 'mdi-floppy',
      authorUrls: [],
      fullsizes: [],
      polleeFileSources: [],
      sourceTypesById: swap(sourceTypes)
    };
  },
  computed: {
    exifExists() {
      return (
        this.currentFile?.exif_create_date ||
        (this.currentFile?.exif_latitude && this.currentFile?.exif_longitude) ||
        this.currentFile?.exif_make
      );
    },
    currentFileDateCreated() {
      if (!this.currentFile?.exif_create_date) {
        return null;
      }
      return new Date(this.currentFile.exif_create_date * 1000).toLocaleString(
        'ru'
      );
    },
    currentFileCoords() {
      if (
        !this.currentFile?.exif_latitude ||
        !this.currentFile?.exif_longitude
      ) {
        return null;
      }
      return [
        this.currentFile?.exif_latitude,
        this.currentFile?.exif_longitude
      ].join(',');
    },
    currentFileModel() {
      if (!this.currentFile?.exif_make || !this.currentFile?.exif_model) {
        return null;
      }
      return this.currentFile.exif_make + ' ' + this.currentFile.exif_model;
    }
  },
  methods: {
    // Callable from parent component
    async showComponent(file) {
      if (!file?.id) {
        return false;
      }
      this.isDialogVisible = true;
      if (this.$refs.predicted_tags) {
        this.$refs.predicted_tags.reset();
      }
      this.currentFile = file;
      this.tags = await window.sqliteApi.findTagsByFile(file.id);
      let authors = this.tags.filter(
        (t) => t.namespace_id == tagNamespaces.CREATOR
      );
      for (let i in authors) {
        let urls = await window.sqliteApi.getAuthorUrls(authors[i].id);
        this.authorUrls.push(...urls);
      }
      this.fullsizes = await window.sqliteApi.getFileFullsizes(file.id);
      this.polleeFileSources = await window.sqliteApi.queryAll(
        'SELECT * FROM pollee_file_sources WHERE file_id=?',
        [file.id]
      );
      this.urls = (
        await window.sqliteApi.queryAll(
          'SELECT url, title FROM file_urls WHERE file_id=?',
          [file.id]
        )
      ).map((t) => {
        return {
          url: t.url,
          title: t.title
        };
      });
    },
    hideComponent() {
      if (this.$refs.predicted_tags) {
        this.$refs.predicted_tags.reset();
      }
      this.isDialogVisible = false;
      this.tags = [];
      this.urls = [];
      this.authorUrls = [];
      this.fullsizes = [];
    },
    async afterAddTagHandler(event) {
      this.tags.push(event);
      this.$emit('added-tag', event);
    },
    async updateCaption() {
      if (!this.currentFile?.id) {
        console.log('Have no current file!');
        return false;
      }
      await window.sqliteApi.query('UPDATE files SET caption=? WHERE id=?', [
        this.currentFile?.caption,
        this.currentFile?.id
      ]);
      this.$emit(
        'toast',
        this.$t('dialog_show_file.caption_updated_for_file_x', [
          this.currentFile?.id
        ])
      );
    },
    clickedOnCaptionTextarea(event) {
      if (event?.path?.[0]?.nodeName == 'I') {
        this.updateCaption();
        this.fileCaptionTextareaIcon = 'mdi-floppy';
      }
    },
    // Callable from parent component
    updateTag({ newLocales, tagId }) {
      if (!this.isDialogVisible) {
        return false;
      }
      this.tags = this.tags.map((t) => {
        if (t.id != tagId) {
          return t;
        }
        t.locales = newLocales;
        return t;
      });
    },
    async improveFile(url) {
      let updatedFile = await window.fileApi.improveFile(
        this.currentFile.id,
        url
      );
      if (updatedFile) {
        this.currentFile = updatedFile;
        this.$emit('toast', this.$t('toast.file_improved'));
      } else {
        this.$emit('toast', this.$t('toast.file_not_improved'));
      }
    },
    goPrev() {
      this.showComponent(this.currentFile.prev);
    },
    goNext() {
      this.showComponent(this.currentFile.next);
    },
    async removePolleeFileSource(row_id) {
      if (await window.sqliteApi.removePolleeFileSource(row_id)) {
        this.polleeFileSources = this.polleeFileSources.filter(
          (r) => r.id != row_id
        );
      }
    }
  }
};
</script>

<style>
.clickable-i i {
  cursor: pointer !important;
}
</style>
