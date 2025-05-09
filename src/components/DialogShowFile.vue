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
            <list-tag-groups
              :tags="tags"
              closable-tags
              filter-by-source
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

            <v-card
              v-if="currentFile.file_birthtime"
              elevation="4"
              class="ma-2 pa-8"
            >
              <h5>{{ $t('dialog_show_file.birthtime') }}</h5>
              <div>
                {{ fileBirthtimeDate }}
              </div>
            </v-card>

            <v-card elevation="4" class="ma-2 pa-8">
              <h5>{{ $t('dialog_show_file.size_parameters') }}</h5>
              <div>
                <b>{{ $t('image.width') }}:</b> {{ currentFile.width }}
                <b>{{ $t('image.height') }}:</b> {{ currentFile.height }}
              </div>
              <v-checkbox
                v-model="currentFile.is_safe"
                :label="$t('settings.dialog_show_file.is_safe')"
                @change="onIsSafeUpdated"
              />
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

            <v-card
              v-if="AIMetadataExists"
              id="file_info_ai_metadata"
              elevation="4"
              class="ma-2 pa-4"
            >
              <h4>{{ $t('dialog_show_file.ai_metadata') }}</h4>
              <div v-if="currentFile.neuro_prompt">
                {{ $t('dialog_show_file.ai_prompt') }}:
                {{ currentFile.neuro_prompt }}
              </div>
              <div v-if="currentFile.neuro_negativePrompt">
                {{ $t('dialog_show_file.ai_negative_prompt') }}:
                {{ currentFile.neuro_negativePrompt }}
              </div>
              <div v-if="currentFile.neuro_steps">
                {{ $t('dialog_show_file.ai_steps') }}:
                {{ currentFile.neuro_steps }}
              </div>
              <div v-if="currentFile.neuro_sampler">
                {{ $t('dialog_show_file.ai_sampler') }}:
                {{ currentFile.neuro_sampler }}
              </div>
              <div v-if="currentFile.neuro_cfgScale">
                {{ $t('dialog_show_file.ai_cfg_scale') }}:
                {{ currentFile.neuro_cfgScale }}
              </div>
              <div v-if="currentFile.neuro_seed">
                {{ $t('dialog_show_file.neuro_seed') }}:
                {{ currentFile.neuro_seed }}
              </div>
              <div v-if="currentFile.neuro_model">
                {{ $t('dialog_show_file.neuro_model') }}:
                {{ currentFile.neuro_model }}
              </div>
              <div v-if="currentFile.neuro_loras">
                {{ $t('dialog_show_file.neuro_loras') }}:
                {{ currentFile.neuro_loras }}
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
                    <a :href="row.url" target="_blank" :title="row.url">
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

            <div>
              <v-btn color="warning" @click="isFileRemovingInDialog = true">
                {{ $t('dialog_show_file.remove_file') }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-dialog v-model="isFileRemovingInDialog">
    <v-card>
      <v-card-title style="text-align: center">
        {{ $t('dialog_show_file.remove_file') }}
      </v-card-title>
      <v-card-text style="text-align: center">
        {{ $t('dialog_tag_editor.confirm_removing') }}
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="green" @click="isFileRemovingInDialog = false">
          {{ $t('button.cancel') }}
        </v-btn>
        <v-btn color="warning" @click="removeFile()">
          {{ $t('dialog_show_file.remove_file') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import FormAddNewTagToFile from '@/components/FormAddNewTagToFile.vue';
import ListTagGroups from '@/components/ListTagGroups.vue';
import tagNamespaces from '@/config/tag_namespaces.js';
import sourceTypes from '@/config/source_type.json';
import { swap } from '@/services/utils.js';

export default {
  name: 'DialogShowFile',
  components: { FormAddNewTagToFile, ListTagGroups },
  emits: [
    'search-by-tag',
    'toast',
    'added-tag',
    'tag-removed',
    'file-removed',
    'close'
  ],
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
      sourceTypesById: swap(sourceTypes),
      isFileRemovingInDialog: false
    };
  },
  computed: {
    fileBirthtimeDate() {
      const date = new Date(this.currentFile.file_birthtime);
      return date.toLocaleString();
    },
    exifExists() {
      return (
        this.currentFile?.exif_create_date ||
        (this.currentFile?.exif_latitude && this.currentFile?.exif_longitude) ||
        this.currentFile?.exif_make
      );
    },
    AIMetadataExists() {
      return (
        this.currentFile?.neuro_model ||
        this.currentFile?.neuro_seed ||
        this.currentFile?.neuro_cfgScale ||
        this.currentFile?.neuro_sampler ||
        this.currentFile?.neuro_steps ||
        this.currentFile?.neuro_negativePrompt ||
        (Array.isArray(this.currentFile.neuro_loras) &&
          this.currentFile?.neuro_loras.length > 0) ||
        this.currentFile?.neuro_prompt
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
      this.currentFile = await window.sqliteApi.getFile(file.id);
      this.currentFile.prev = file.prev;
      this.currentFile.next = file.next;
      if (![true, false].includes(this.currentFile.is_safe)) {
        this.currentFile.is_safe = this.currentFile.is_safe === 1;
      }
      this.reloadStuff();
      this.isDialogVisible = true;
    },
    hideComponent() {
      this.isDialogVisible = false;
      this.tags = [];
      this.urls = [];
      this.authorUrls = [];
      this.fullsizes = [];
      this.isFileRemovingInDialog = false;
      this.$emit('close');
    },
    async afterAddTagHandler(event) {
      this.tags.push(event);
      this.$emit('added-tag', event);
    },
    setCaption(caption) {
      this.currentFile.caption = caption;
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
    async reloadStuff() {
      this.tags = await window.sqliteApi.findTagsByFile(this.currentFile.id);
      let authors = this.tags.filter(
        (t) => t.namespace_id == tagNamespaces.CREATOR
      );
      for (let i in authors) {
        this.authorUrls = [];
        let urls = await window.sqliteApi.getAuthorUrls(authors[i].id);
        this.authorUrls.push(...urls);
      }
      this.fullsizes = await window.sqliteApi.getFileFullsizes(
        this.currentFile.id
      );
      this.polleeFileSources = await window.sqliteApi.queryAll(
        'SELECT * FROM pollee_file_sources WHERE file_id=?',
        [this.currentFile.id]
      );
      this.urls = (
        await window.sqliteApi.queryAll(
          'SELECT url, title FROM file_urls WHERE file_id=?',
          [this.currentFile.id]
        )
      ).map((t) => {
        return {
          url: t.url,
          title: t.title
        };
      });
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
    // Callable from parent component
    updateTagNamespace({ tag_id, namespace_id }) {
      if (!this.isDialogVisible) {
        return false;
      }
      this.tags = this.tags.map((t) =>
        t?.id == tag_id ? { ...t, namespace_id: namespace_id } : t
      );
    },
    async improveFile(url) {
      let updatedFile = await window.fileApi.improveFile(
        this.currentFile.id,
        url
      );
      if (updatedFile) {
        if (![true, false].includes(updatedFile.is_safe)) {
          updatedFile.is_safe = updatedFile.is_safe === 1;
        }
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
    },
    async removeFile() {
      if (await window.fileApi.removeFileById(this.currentFile?.id)) {
        this.hideComponent();
        this.$emit('file-removed', this.currentFile);
      } else {
        this.$emit('toast', this.$t('dialog_show_file.wrong_file_removing'));
        this.isFileRemovingInDialog = false;
      }
    },
    onIsSafeUpdated() {
      let newVal = !!this.currentFile.is_safe;
      console.log(
        'switched is_safe checkbox for file',
        this.currentFile?.id,
        newVal
      );
      window.sqliteApi.updateFileIsSafeField(this.currentFile?.id, newVal);
    }
  }
};
</script>

<style>
.clickable-i i {
  cursor: pointer !important;
}
</style>
