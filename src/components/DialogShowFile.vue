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
            title="Go back"
            @click="isDialogVisible = null"
          />
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <h3>Tags</h3>
            <form-add-new-tag-to-file
              v-if="currentFile"
              :file-id="currentFile?.id"
              @after-add-tag="afterAddTagHandler($event)"
            />
            <list-tag-groups
              :tags-groupped="tagsGroupped(tags)"
              @search-by-title="
                $emit('search-by-tag', $event);
                hideComponent();
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
              v-if="exifExists"
              id="file_info_exif"
              elevation="4"
              class="ma-2 pa-4"
            >
              <h4>Exif data</h4>
              <div v-if="currentFileDateCreated">
                Create date: {{ currentFileDateCreated }}
              </div>
              <div v-if="currentFileCoords">
                Coordinates:
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
                Maked by: {{ currentFileModel }}
              </div>
            </v-card>
            <v-card elevation="4" class="ma-2 clickable-i">
              <v-textarea
                v-model="currentFile.caption"
                label="recognized text on image"
                title="Click to floppy to save changes"
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
                <h5>Sources</h5>
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
import MixinTagsGroupped from '@/components/MixinTagsGroupped.js';
import ListTagGroups from '@/components/ListTagGroups.vue';

export default {
  name: 'DialogShowFile',
  components: { FormAddNewTagToFile, ListTagGroups },
  mixins: [MixinTagsGroupped],
  emits: ['search-by-tag'],
  data() {
    return {
      isDialogVisible: false,
      tags: [],
      urls: [],
      currentFile: null,
      fileCaptionTextareaIcon: 'mdi-floppy'
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
    },
    async afterAddTagHandler(event) {
      this.tags.push(event);
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
      this.statusMessage = `Caption updated for file #${this.currentFile?.id}`;
    },
    clickedOnCaptionTextarea(event) {
      if (event?.path?.[0]?.nodeName == 'I') {
        this.updateCaption();
        this.fileCaptionTextareaIcon = 'mdi-floppy';
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
