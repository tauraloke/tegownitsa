<template>
  <header>
    <v-btn color="light" @click="toggleTheme()">toggle theme</v-btn>
    <v-btn @click="openFolder()">Import folder</v-btn>
    <v-btn @click="openFile()">Import file</v-btn>
    <v-btn @click="importFileFromUrl()">Import file from url</v-btn>
    <v-btn @click="importFromClipboard()">Import file from clipboard</v-btn>
    <v-btn @click="scanSelectedFiles()">Scan these files</v-btn>
    <v-btn @click="showAllTags()">Show all tags</v-btn>
    <v-btn @click="lookUpDups()">Find duplicates</v-btn>
    <v-btn @click="loadTagsFromIQDB()">Load tags from IQDB</v-btn>

    <form-search-files
      @by-tags="searchFilesByTags($event)"
      @by-caption="searchFilesByCaption($event)"
    />
  </header>
  <section class="main">
    <div v-if="currentTag" id="tag_edit_form_container"></div>

    <div id="tags">
      <form-add-new-tag-to-file
        v-if="currentFile"
        :file-id="currentFile?.id"
        @after-add-tag="afterAddTagHandler($event)"
      />
      <div v-for="group in tagsGroupped" :key="group.id" class="tags_namespace">
        <h4>{{ group.name }}</h4>
        <div v-for="tag in group.tags" :key="tag?.id">
          <a
            :title="tag?.locales.map((l) => l.title)"
            @click="searchFilesByTag(tag?.locales?.[0]?.title)"
            >{{ tag?.locales?.[0]?.title }}</a
          >

          <v-btn
            class="ma-2"
            title="Edit the tag"
            outlined
            size="x-small"
            color="info"
            fab
            icon="mdi-pencil"
            @click="editTag(tag?.id)"
          />

          <v-btn
            class="ma-2"
            title="Edit the tag"
            outlined
            size="x-small"
            color="secondary"
            fab
            icon="mdi-delete"
            @click="removeTagFromFile(tag?.file_tag_id)"
          />
        </div>
      </div>
    </div>

    <div v-if="files?.length > 0" id="files">
      <div
        v-for="file in files"
        :key="file?.id"
        :data="{ id: file?.id }"
        class="gallery_block"
      >
        <img
          :src="'file://' + file?.preview_path"
          :title="file?.source_filename"
          class="gallery_image"
          @click="showFile(file)"
        />
      </div>
    </div>

    <div v-if="duplicatedFiles?.length > 0" id="duplicated_files">
      {{ duplicatedFiles }}
    </div>

    <div v-if="currentFile" id="file_info">
      <div id="file_info_header">{{ currentFile.source_filename }}</div>
      <div id="file_info_img_container">
        <img id="file_info_img" :src="'file://' + currentFile.full_path" />
      </div>
      <div v-if="exifExists" id="file_info_exif">
        <div v-if="currentFileDateCreated">
          Create date: {{ currentFileDateCreated }}
        </div>
        <div v-if="currentFileCoords">
          <a
            :href="'https://www.google.com/maps/place/' + currentFileCoords"
            target="_blank"
            >{{ currentFileCoords }}</a
          >
        </div>
        <div v-if="currentFileModel">Maked by: {{ currentFileModel }}</div>
      </div>
      <div id="file_info_caption_container">
        <textarea
          id="file_info_caption"
          v-model="currentFile.caption"
        ></textarea>
      </div>
      <div id="file_info_update_caption">
        <v-btn @click="updateCaption()">Update caption</v-btn>
      </div>
      <div id="file_info_sources"></div>
    </div>
  </section>
  <footer>
    <div>{{ statusMessage }}</div>
  </footer>
</template>

<script>
import { useTheme } from 'vuetify';
import { thisExpression } from '@babel/types';

import FormAddNewTagToFile from './components/FormAddNewTagToFile.vue';
import FormSearchFiles from './components/FormSearchFiles.vue';

import Job from './services/job.js';
import tagResources from './config/tag_resources.js';
import tagNamespaces from './config/tag_namespaces.json';
import { swap } from './services/utils.js';

const tagNameSpacesById = swap(tagNamespaces);
const CAPTION_NOT_FOUND = '[NO CAPTION FOUND]';
const DUPLICATE_HAMMING_THRESHOLD = 7;

export default {
  name: 'App',
  components: {
    FormAddNewTagToFile,
    FormSearchFiles
  },
  setup() {
    const theme = useTheme();
    return {
      theme,
      toggleTheme: () => {
        console.log(theme.global.name.value, theme.global.current.value.dark);
        theme.global.name.value = theme.global.current.value.dark
          ? 'light'
          : 'dark';
      }
    };
  },
  data() {
    return {
      statusMessage: '',
      tags: [],
      currentFile: null,
      duplicatedFiles: null,
      files: [],
      searchString: '',
      currentTag: null,
      tagNameSpacesById: tagNameSpacesById,
      isTagsAutoCompleteLoading: false,
      jobs: {
        iqdb: new Job(10, 15),
        danbooru: new Job(10, 15),
        konachan: new Job(10, 15),
        yandere: new Job(10, 15),
        gelbooru: new Job(10, 15),
        sankaku: new Job(10, 15),
        eshuushuu: new Job(10, 15),
        zerochan: new Job(10, 15),
        anime_pictures: new Job(10, 15)
      }
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
    },
    tagsGroupped() {
      let groups = [];
      for (let i = 0; i < this.tags.length; i++) {
        let tag = this.tags[i];
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
    }
  },
  mounted() {
    this.searchFilesByCaption('');
    this.showAllTags();
  },
  methods: {
    async afterAddTagHandler(event) {
      console.log(event);
      this.tags.push(event);
    },
    async removeTagFromFile(_file_tag_id) {
      // TODO
    },
    async editTag(_tag_id) {
      // TODO
    },
    async searchFilesByTags(tags_titles) {
      this.currentFile = null;
      this.statusMessage = `Start search by tag '${tags_titles}'`;
      this.files = await window.sqliteApi.findFilesByTags(tags_titles);
      this.statusMessage = `Found ${this.files.length} results by tag '${tags_titles}'`;
    },
    async searchFilesByCaption(caption = '') {
      this.currentFile = null;
      this.tags = [];
      this.statusMessage = `Start search by caption '${caption}'`;
      let files = await window.sqliteApi.queryAll(
        'SELECT * FROM files WHERE caption LIKE "%" || ? || "%" OR source_filename LIKE "%" || ? || "%"',
        [caption, caption]
      );
      this.files = files;
      this.statusMessage = `Found ${this.files.length} results by caption '${caption}'`;
    },
    async showFile(file) {
      this.currentFile = file;
      this.tags = await window.sqliteApi.findTagsByFile(file.id);
    },
    async openFolder() {
      let folder = await window.fileApi.openFolder();
      if (!(folder && folder.filePaths && folder.filePaths[0])) return false;
      let path = folder.filePaths[0];
      console.log(`Loading folder ${path}`);
      await window.fileApi.addFilesFromFolder(path);
      this.statusMessage = `Folder ${path} has imported.`;
    },
    async openFile() {
      let file = await window.fileApi.openFile();
      if (!(file && file.filePaths && file.filePaths[0])) {
        return false;
      }
      let path = file.filePaths[0];
      console.log(`Chosen file ${path}`);
      await window.fileApi.addFile(path);
      this.statusMessage = `File ${path} has imported.`;
    },
    async importFromClipboard() {
      const tmpFilePath = await window.fileApi.saveTempFileFromClipboard();
      if (!tmpFilePath) {
        this.statusMessage = 'Clipboard is empty.';
        return false;
      }
      await window.fileApi.addFile(tmpFilePath);
      await window.fileApi.removeFile(tmpFilePath);
      this.statusMessage = 'File has imported from a clipboard.';
    },
    async importFileFromUrl() {
      let url = await window.widget.prompt();
      if (!url) {
        this.statusMessage = 'Form is cancelled';
        return false;
      }
      const tmpFilePath = await window.fileApi.saveTempFileFromUrl(url);
      if (!tmpFilePath) {
        thisExpression.statusMessage = `Can't upload file from ${url}.`;
        return false;
      }
      let { file_id } = await window.fileApi.addFile(tmpFilePath);
      await window.fileApi.removeFile(tmpFilePath);
      if (!file_id) {
        this.statusMessage = `Can't copy file from ${url}.`;
        return false;
      }
      await window.sqliteApi.addUrlToFile(url, file_id);
      this.statusMessage = `File has imported from url '${url}'.`;
    },
    async showAllTags() {
      this.tags = await window.sqliteApi.getAllTags();
    },
    async updateCaption() {
      if (!this.currentFile?.id) {
        this.statusMessage = 'Have no current file!';
        return false;
      }
      let newCaption = document.getElementById('file_info_caption').value;
      this.currentFile.caption = newCaption;
      await window.sqliteApi.query('UPDATE files SET caption=? WHERE id=?', [
        newCaption,
        this.currentFile?.id
      ]);
      this.statusMessage = `Caption updated for file #${this.currentFile?.id}`;
    },
    async scanSelectedFiles() {
      for (let i = 0; i < this.files.length; i++) {
        let file = this.files[i];
        if (await window.ocrApi.fileIsNotScanned(file)) {
          try {
            console.log('Scan file: ', file);
            let recognized = await window.ocrApi.recognize(file['full_path'], [
              'eng',
              'rus',
              'jpn'
            ]); // TODO: move languages to app settings
            console.log('Recognized: ', recognized);
            let caption = recognized.data.blocks
              .filter((b) => b.text.trim() != '' && b.confidence > 70)
              .map((b) => b.text.replace(/[\n\t\r]/g, ' '))
              .join('\n');
            if (caption == '') {
              caption = CAPTION_NOT_FOUND;
            }
            console.log(`#${file['id']}: Scanned text: ${caption}`);
            await window.sqliteApi.query(
              'UPDATE files SET caption=? WHERE id=?;',
              [caption, file['id']]
            );
            this.files[i].caption = caption;
          } catch (e) {
            console.error(e);
            this.statusMessage = 'Something wrong with scanning...';
          }
        }
      }
    },
    async lookUpDups(threshold = DUPLICATE_HAMMING_THRESHOLD) {
      let dups = await window.sqliteApi.queryAll(
        'SELECT files.*, files2.id AS f2_id, files2.preview_path AS f2_preview_path, files2.width AS f2_width, files2.height AS f2_height, hamming(files.imagehash, files2.imagehash) AS distance FROM files JOIN files AS files2 ON files.id > files2.id WHERE distance < ?',
        [threshold]
      );
      this.currentFile = null;
      this.duplicatedFiles = dups;
      this.statusMessage = `${dups.length} pairs found`;
    },
    async loadTagsFromIQDB() {
      this.statusMessage = `Start loading tags for ${this.files.length} files`;
      for (let i = 0; i < this.files.length; i++) {
        let file = this.files[i];
        this.jobs.iqdb.addTask(async () => {
          let response = await window.network.lookupIqdbFile(
            file['preview_path']
          );
          if (response.ok && response.data && response.data[1]) {
            let bestMatch = response.data[1];
            let resource = tagResources.find((r) =>
              bestMatch.sourceUrl.match(r.mask)
            );
            if (resource) {
              Job.addJobTask(
                this.jobs,
                resource.name,
                resource.locale,
                bestMatch.sourceUrl,
                file
              );
            }
          }
        });
      }
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
