<template>
  <v-app>
    <header>
      <v-btn @click="openFolder()">Import folder</v-btn>
      <v-btn @click="openFile()">Import file</v-btn>
      <v-btn @click="importFileFromUrl()">Import file from url</v-btn>
      <v-btn @click="importFromClipboard()">Import file from clipboard</v-btn>
      <v-btn @click="scanSelectedFiles()">Scan these files</v-btn>
      <v-btn @click="showAllTags()">Show all tags</v-btn>
      <v-btn @click="lookUpDups()">Find duplicates</v-btn>
      <v-btn @click="loadTagsFromIQDB()">Load tags from IQDB</v-btn>

      <form-search-files
        ref="form_search_files"
        @by-tags="searchFilesByTags($event)"
        @by-caption="searchFilesByCaption($event)"
      />
    </header>

    <main style="padding-bottom: 4em">
      <v-row>
        <v-col cols="12" sm="4">
          <div id="tags">
            <h3>Tags</h3>
            <list-tag-groups
              :tags="tags"
              @search-by-title="searchFilesByTag($event)"
              @tag-added="tags.push($event)"
            />
          </div>
        </v-col>

        <v-col cols="12" sm="8">
          <h3 v-if="files?.length > 0">Files</h3>
          <v-row v-if="files?.length > 0" id="files">
            <v-col
              v-for="file in files"
              :key="file.id"
              class="d-flex child-flex"
              cols="2"
            >
              <v-img
                :data="{ id: file?.id }"
                :src="'file://' + file?.preview_path"
                :title="file?.source_filename"
                aspect-ratio="1"
                width="140"
                contain
                class="bg-grey-lighten-2 pointer-clickable pretty-corners elevation-4"
                @click="showFile(file)"
              />
            </v-col>
          </v-row>

          <div v-if="duplicatedFiles?.length > 0" id="duplicated_files">
            {{ duplicatedFiles }}
          </div>
        </v-col>
      </v-row>
    </main>

    <dialog-show-file
      ref="dialog_show_file"
      @search-by-tag="searchFilesByTag($event)"
      @toast="toast($event)"
    />

    <v-dialog v-model="showDialogUrlForImport">
      <v-card class="prompt-dialog-card">
        <v-card-text>
          <v-text-field
            v-model="urlForImport"
            label="URL"
            prepend-inner-icon="mdi-earth"
          />
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn @click="importFileFromUrl()">Upload</v-btn>
          <v-btn @click="showDialogUrlForImport = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <dialog-preferences
      ref="dialog_preferences"
      @option-changed="updateAppOptions"
    />

    <v-snackbar v-model="isStatusMessageVisible">
      {{ statusMessage }}
      <template #actions>
        <v-btn
          icon="mdi-close"
          title="Close"
          @click="isStatusMessageVisible = null"
        />
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import { useTheme } from 'vuetify';

import FormSearchFiles from '@/components/FormSearchFiles.vue';
import ListTagGroups from '@/components/ListTagGroups.vue';
import DialogPreferences from '@/components/DialogPreferences.vue';
import DialogShowFile from '@/components/DialogShowFile.vue';

import Job from '@/services/job.js';
import constants from '@/config/constants.json';
import FabricJobTagSourceStrategy from '@/services/tag_sources_strategies/fabric_tag_source_strateges.js';

const DUPLICATE_HAMMING_THRESHOLD = 7; // TODO: вынести в настройки

export default {
  name: 'WindowMain',
  components: {
    FormSearchFiles,
    ListTagGroups,
    DialogPreferences,
    DialogShowFile
  },
  setup() {
    const theme = useTheme();
    return {
      theme,
      setTheme: (isDark) => {
        theme.global.name.value = isDark ? 'dark' : 'light';
      }
    };
  },
  data() {
    return {
      statusMessage: '',
      isStatusMessageVisible: false,
      tags: [],
      currentFile: null,
      currentFileUrls: null,
      currentFileTags: [],
      duplicatedFiles: [],
      files: [],
      task_queues: {},
      showDialogUrlForImport: false,
      urlForImport: null,
      appOptions: {}
    };
  },
  watch: {
    'appOptions.dark_theme': function (newValue, _oldValue) {
      this.setTheme(newValue);
    }
  },
  mounted() {
    window.busApi.executeListener((_event, method, ...args) => {
      let allowedMenuMethods = [
        'openFile',
        'openFolder',
        'importFileFromUrl',
        'importFromClipboard',
        'scanSelectedFiles',
        'lookUpDups',
        'loadTagsFromIQDB',
        'openPreferencesDialog',
        'setTheme'
      ];
      if (method in allowedMenuMethods) {
        return false;
      }
      this[method](...args);
    });
    this.searchFilesByCaption('');
    this.showAllTags();
    window.configApi.getConfig('dark_theme').then((isDark) => {
      if (isDark) {
        this.setTheme(isDark);
      }
    });
    window.configApi
      .getConfig('tag_source_iqdb_bottom_cooldown')
      .then((bottom_cooldown) => {
        window.configApi
          .getConfig('tag_source_iqdb_top_cooldown')
          .then((top_cooldown) => {
            this.task_queues.iqdb = new Job(bottom_cooldown, top_cooldown);
            this.task_queues.danbooru = new Job(bottom_cooldown, top_cooldown);
            this.task_queues.konachan = new Job(bottom_cooldown, top_cooldown);
            this.task_queues.yandere = new Job(bottom_cooldown, top_cooldown);
            this.task_queues.gelbooru = new Job(bottom_cooldown, top_cooldown);
            this.task_queues.sankaku = new Job(bottom_cooldown, top_cooldown);
            this.task_queues.eshuushuu = new Job(bottom_cooldown, top_cooldown);
            this.task_queues.zerochan = new Job(bottom_cooldown, top_cooldown);
            this.task_queues.anime_pictures = new Job(
              bottom_cooldown,
              top_cooldown
            );
          });
      });
  },
  methods: {
    async searchFilesByTag(tag_title) {
      this.$refs.form_search_files.reset(tag_title);
    },
    async searchFilesByTags(tags_titles) {
      this.hideFile();
      this.files = await window.sqliteApi.findFilesByTags(tags_titles);
      this.toast(`Found ${this.files.length} results by tag '${tags_titles}'`);
    },
    async searchFilesByCaption(caption = '') {
      this.hideFile();
      this.tags = [];
      let files = await window.sqliteApi.queryAll(
        'SELECT * FROM files WHERE caption LIKE "%" || ? || "%" OR source_filename LIKE "%" || ? || "%"',
        [caption, caption]
      );
      this.files = files;
      this.toast(`Found ${this.files.length} results by caption '${caption}'`);
    },
    async showFile(file) {
      this.$refs.dialog_show_file.showComponent(file);
    },
    async hideFile() {
      this.$refs.dialog_show_file.hideComponent();
    },
    async openFolder() {
      let folder = await window.fileApi.openFolder();
      if (!(folder && folder.filePaths && folder.filePaths[0])) return false;
      let path = folder.filePaths[0];
      console.log(`Loading folder ${path}`);
      await window.fileApi.addFilesFromFolder(path);
      this.toast(`Folder ${path} has imported.`);
    },
    async openFile() {
      let file = await window.fileApi.openFile();
      if (!(file && file.filePaths && file.filePaths[0])) {
        return false;
      }
      let path = file.filePaths[0];
      console.log(`Chosen file ${path}`);
      await window.fileApi.addFile(path);
      this.toast(`File ${path} has imported.`);
    },
    async importFromClipboard() {
      const tmpFilePath = await window.fileApi.saveTempFileFromClipboard();
      if (!tmpFilePath) {
        this.toast('Clipboard is empty.');
        return false;
      }
      await window.fileApi.addFile(tmpFilePath);
      await window.fileApi.removeFile(tmpFilePath);
      this.toast('File has imported from a clipboard.');
    },
    async importFileFromUrl() {
      if (!this.showDialogUrlForImport) {
        this.urlForImport = null;
        this.showDialogUrlForImport = true;
        return;
      }
      this.showDialogUrlForImport = false;
      if (!this.urlForImport) {
        this.toast('Form is cancelled');
        return false;
      }
      const tmpFilePath = await window.fileApi.saveTempFileFromUrl(
        this.urlForImport
      );
      if (!tmpFilePath) {
        this.toast(`Can't upload file from ${this.urlForImport}.`);
        return false;
      }
      let { file_id } = await window.fileApi.addFile(tmpFilePath);
      await window.fileApi.removeFile(tmpFilePath);
      if (!file_id) {
        this.toast(`Can't copy file from ${this.urlForImport}.`);
        return false;
      }
      await window.sqliteApi.addUrlToFile(this.urlForImport, file_id);
      this.toast(`File has imported from url '${this.urlForImport}'.`);
    },
    async showAllTags() {
      this.tags = await window.sqliteApi.getAllTags();
    },
    async scanSelectedFiles() {
      for (let i = 0; i < this.files.length; i++) {
        let file = this.files[i];
        if (file?.caption != constants.CAPTION_YET_NOT_SCANNED) {
          continue;
        }
        try {
          console.log('Scan file: ', file);
          let recognized = await window.ocrApi.recognize(file['full_path']);
          console.log('Recognized: ', recognized);
          let caption = recognized.data.blocks
            .filter((b) => b.text.trim() != '' && b.confidence > 70)
            .map((b) => b.text.replace(/[\n\t\r]/g, ' '))
            .join('\n');
          if (caption == '') {
            caption = constants.CAPTION_NOT_FOUND;
          }
          console.log(`#${file['id']}: Scanned text: ${caption}`);
          await window.sqliteApi.query(
            'UPDATE files SET caption=? WHERE id=?;',
            [caption, file['id']]
          );
          this.files[i].caption = caption;
        } catch (e) {
          console.error(e);
          this.toast('Something wrong with scanning...');
        }
      }
    },
    async lookUpDups(threshold = DUPLICATE_HAMMING_THRESHOLD) {
      let dups = await window.sqliteApi.queryAll(
        'SELECT files.*, files2.id AS f2_id, files2.preview_path AS f2_preview_path, files2.width AS f2_width, files2.height AS f2_height, hamming(files.imagehash, files2.imagehash) AS distance FROM files JOIN files AS files2 ON files.id > files2.id WHERE distance < ?',
        [threshold]
      );
      this.hideFile();
      this.duplicatedFiles = dups;
      this.toast(`${dups.length} pairs found`);
    },
    toast(message) {
      this.statusMessage = message;
      this.isStatusMessageVisible = true;
    },
    async loadTagsFromIQDB() {
      this.toast(`Start loading tags for ${this.files.length} files`);
      let strategy = FabricJobTagSourceStrategy.getStrategy({
        key: await window.configApi.getConfig('tag_source_strategies'),
        engine: 'iqdb'
      });
      let iqdb_threshold = await window.configApi.getConfig(
        'tag_source_threshold_iqdb'
      );
      if (iqdb_threshold === undefined) {
        iqdb_threshold = 0.8;
      }
      for (let i = 0; i < this.files.length; i++) {
        let file = this.files[i];
        this.task_queues.iqdb.addTask(async () => {
          console.log(`Looking #${file.id} ${file['preview_path']} at IQDB`);
          let response = await window.network.lookupIqdbFile(
            file['preview_path']
          );
          if (response.ok && response?.data?.length > 0) {
            let candidatesList = response.data?.filter(
              (b) => b?.similarity > iqdb_threshold
            );
            strategy.run({
              file,
              jobList: this.task_queues,
              candidatesList: candidatesList
            });
          }
        });
      }
    },
    openPreferencesDialog() {
      this.$refs.dialog_preferences.showComponent();
    },
    updateAppOptions(name, value) {
      this.toast('Preferences saved');
      this.appOptions[name] = value;
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

.prompt-dialog-card {
  width: 50vw;
}

.pointer-clickable {
  cursor: pointer;
}

.pretty-corners {
  border-radius: 5px;
}

#files {
  margin-right: 2em;
}
</style>
