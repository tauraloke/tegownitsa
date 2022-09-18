<template>
  <v-dialog v-model="isDialogVisible" fullscreen scrollable>
    <v-card v-if="currentFile">
      <v-toolbar>
        <v-toolbar-title>
          {{ currentFile.source_filename }}
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
        <v-row>
          <v-col cols="12" md="4">
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
              :current-file="currentFile"
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
              @tag-removed="$emit('tag-removed', $event)"
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
            <div v-if="urls && urls.length > 0" id="file_info_sources">
              <v-card elevation="4" class="ma-2 pa-8">
                <h5>{{ $t('dialog_show_file.sources') }}</h5>
                <ul>
                  <li v-for="url in urls" :key="url">
                    <a :href="url" target="_blank">{{ url }}</a>
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
      predictedTags: []
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
      this.currentFile = file;
      this.tags = await window.sqliteApi.findTagsByFile(file.id);
      this.urls = (
        await window.sqliteApi.queryAll(
          'SELECT url FROM file_urls WHERE file_id=?',
          [file.id]
        )
      ).map((t) => t.url);
    },
    hideComponent() {
      this.isDialogVisible = false;
      this.tags = [];
      this.predictedTags = [];
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
    async predictTags() {
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
      let items = autoTaggerResponse.result;
      console.table(
        items.map((t) => {
          return {
            name: t.tag.name,
            namespace: t.tag.namespace,
            score: t.score
          };
        })
      );
      this.predictedTags = items;
    }
  }
};
</script>

<style>
.clickable-i i {
  cursor: pointer !important;
}
</style>
