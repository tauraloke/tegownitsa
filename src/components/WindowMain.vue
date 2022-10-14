<template>
  <v-app>
    <header>
      <form-search-files
        ref="form_search_files"
        @by-tags="searchFilesByTagTitles($event)"
        @by-tag="searchFilesByTagTitle($event)"
      />
    </header>

    <main style="padding-bottom: 4em">
      <v-row>
        <v-col cols="12" sm="4">
          <!-- author -->
          <v-card v-if="authorUrls?.length > 0" elevation="4" class="ma-2 pa-8">
            <h3>{{ $t('main_window.author_urls') }}</h3>
            <div v-for="url in authorUrls" :key="url.url">
              <a :href="url.url" target="_blank"> {{ url.url }} </a>
            </div>
          </v-card>

          <!-- tags -->
          <div id="tags">
            <h3>{{ $t('main_window.tags') }}</h3>
            <v-progress-linear
              v-if="tagsInProgess"
              indeterminate
              color="white darken-2"
            />
            <list-tag-groups
              :tags="tags"
              @search-by-title="searchFilesByTag($event)"
              @tag-added="tags.push($event)"
              @tag-removed="tags = tags.filter((t) => t.id != $event?.id)"
            />
          </div>
        </v-col>

        <v-col cols="12" sm="8">
          <!-- files -->
          <h3>{{ $t('main_window.files') }}</h3>

          <v-progress-linear
            v-if="filesInProgress"
            indeterminate
            color="white darken-2"
          />
          <div v-if="filePages > 1" class="text-center">
            <v-pagination
              v-model="currentFilesPage"
              :length="filePages"
            ></v-pagination>
          </div>
          <div class="justify-center">
            {{ $t('main_window.found_x_files', files?.length) }}
          </div>
          <v-row id="files" class="mt-4">
            <v-col
              v-for="file in filesOnPage"
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
          <div v-if="filePages > 1" class="text-center">
            <v-pagination
              v-model="currentFilesPage"
              :length="filePages"
            ></v-pagination>
          </div>
        </v-col>
      </v-row>
    </main>

    <dialog-show-file
      ref="dialog_show_file"
      @search-by-tag="searchFilesByTag($event)"
      @added-tag="tags.push($event)"
      @tag-removed="tags = tags.filter((t) => t.id != $event?.id)"
      @file-removed="
        toast($t('toast.file_has_removed'));
        files = files.filter((f) => f?.id != $event?.id);
      "
      @close="currentFile = null"
      @toast="toast($event)"
    />

    <v-dialog v-model="showDialogUrlForImport">
      <v-card class="prompt-dialog-card">
        <v-card-text>
          <v-text-field
            v-model="urlForImport"
            label="URL"
            prepend-inner-icon="mdi-earth"
            autofocus
          />
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn @click="importFileFromUrl()">
            {{ $t('button.upload') }}
          </v-btn>
          <v-btn @click="showDialogUrlForImport = false">{{
            $t('button.cancel')
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <dialog-preferences
      ref="dialog_preferences"
      @update-page-limit="setPageLimit($event)"
    />

    <dialog-dublicates
      ref="dialog_dublicates"
      @show-file="showFile($event)"
      @toast="toast($event)"
    />

    <dialog-tag-editor
      ref="dialog_tag_editor"
      @tag-updated="redrawTag($event)"
      @tag-removed="
        toast($t('toast.tag_removed'));
        tags = tags.filter((t) => t?.id != $event?.id);
      "
      @error="toast($event)"
    />

    <dialog-tag-namespace-editor
      ref="dialog_tag_namespace_editor"
      @tag-updated="updateTagNamespace($event)"
    />

    <v-snackbar v-model="isStatusMessageVisible" style="z-index: 3001">
      {{ statusMessage }}
      <template #actions>
        <v-btn
          icon="mdi-close"
          :title="$t('button.close')"
          @click="isStatusMessageVisible = null"
        />
      </template>
    </v-snackbar>

    <v-footer
      v-if="jobs.length > 0"
      app
      style="display: block !important; z-index: 3000"
    >
      <v-row v-for="job in jobs" :key="job.uid">
        <v-col cols="12" sm="11">
          <v-progress-linear
            v-model="jobProgresses[job.uid]"
            color="blue-grey"
            height="25"
          >
            <template #default="{ value }">
              #{{ job.uid }} | <strong>{{ job.name }}</strong> |
              {{ job.solvedTaskCount }} / {{ job.taskTotalCount }} ({{
                Math.ceil(value)
              }}%) | {{ $t('jobs.time_left') }}: {{ job.getTimeLeft() }}
            </template>
          </v-progress-linear>
        </v-col>
        <v-col cols="12" sm="1">
          <a
            :title="$t('jobs.cancel')"
            style="cursor: pointer"
            @click="job.cancel()"
          >
            {{ $t('button.cancel') }}
          </a>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
import FormSearchFiles from '@/components/FormSearchFiles.vue';
import ListTagGroups from '@/components/ListTagGroups.vue';
import DialogPreferences from '@/components/DialogPreferences.vue';
import DialogShowFile from '@/components/DialogShowFile.vue';
import DialogTagEditor from '@/components/DialogTagEditor.vue';
import DialogTagNamespaceEditor from '@/components/DialogTagNamespaceEditor.vue';
import DialogDublicates from '@/components/DialogDublicates.vue';

import Job from '@/services/job.js';
import TaskQueue from '@/services/task_queue.js';
import IqdbTask from '@/services/tasks/iqdb_task.js';
import SaucenaoTask from '@/services/tasks/saucenao_task.js';
import KheinaTask from '@/services/tasks/kheina_task.js';
import constants from '@/config/constants.json';
import getStrategy from '@/services/tag_sources_strategies/get_strategy.js';
import tagNamespace from '@/config/tag_namespaces.js';
import ParseTagResourceTask from '@/services/tasks/parse_tag_resource_task.js';
import sourceTypes from '@/config/source_type.json';

export default {
  name: 'WindowMain',
  components: {
    FormSearchFiles,
    ListTagGroups,
    DialogPreferences,
    DialogShowFile,
    DialogTagEditor,
    DialogTagNamespaceEditor,
    DialogDublicates
  },
  data() {
    return {
      statusMessage: '',
      isStatusMessageVisible: false,
      tags: [],
      currentFile: null,
      files: [],
      /** @type {Object<string, TaskQueue>} */
      task_queues: {},
      showDialogUrlForImport: false,
      urlForImport: null,
      /** @type {Job[]} */
      jobs: [],
      /** @type {Object<string, number>} */
      jobProgresses: {},
      authorUrls: [],
      tagsInProgess: false,
      filesInProgress: false,
      pageLimit: 30,
      currentFilesPage: 1
    };
  },
  computed: {
    filePages() {
      if (this.pageLimit == 0) {
        return 1;
      }
      return Math.ceil(this.files.length / this.pageLimit);
    },
    filesOnPage() {
      return this.files.slice(
        (this.currentFilesPage - 1) * this.pageLimit,
        this.currentFilesPage * this.pageLimit
      );
    }
  },
  watch: {
    files: function (value) {
      if (!value) {
        this.tags = [];
        return true;
      }
      this.tagsInProgess = true;
      window.sqliteApi
        .getTagsForFiles(
          value
            .slice(
              (this.currentFilesPage - 1) * this.pageLimit,
              this.currentFilesPage * this.pageLimit
            )
            .map((f) => f.id)
        )
        .then((tags) => {
          this.tags = tags;
          this.tagsInProgess = false;
        });
      return true;
    },
    currentFilesPage: function (value) {
      this.tagsInProgess = true;
      window.sqliteApi
        .getTagsForFiles(
          this.files
            .slice((value - 1) * this.pageLimit, value * this.pageLimit)
            .map((f) => f.id)
        )
        .then((tags) => {
          this.tags = tags;
          this.tagsInProgess = false;
        });
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
        'loadTagsFromSaucenao',
        'loadTagsFromKheina',
        'openPreferencesDialog',
        'setTheme',
        'openTagEditor',
        'openTagNamespaceEditor',
        'startDownloadProgress',
        'setDownloadProgress',
        'startArchiveUnpacking',
        'completeArchiveUnpacking',
        'setUpdaterProgress',
        'toast'
      ];
      console.log(`Menu method ${method} with args`, args);
      if (method in allowedMenuMethods) {
        return false;
      }
      this[method](...args);
    });
    this.searchFilesByTagTitle('limit:100');
    window.configApi.getConfig('dark_theme').then((isDark) => {
      if (isDark) {
        this.$root.setTheme(isDark);
      }
    });
    window.configApi.getConfig('page_limit').then((page_limit) => {
      this.pageLimit = page_limit;
    });
    window.configApi.getConfig('tag_source_iqdb_bottom_cooldown').then((bc) => {
      window.configApi.getConfig('tag_source_iqdb_top_cooldown').then((tc) => {
        this.task_queues.iqdb = new TaskQueue(bc, tc);
        this.task_queues.danbooru = new TaskQueue(bc, tc);
        this.task_queues.konachan = new TaskQueue(bc, tc);
        this.task_queues.yandere = new TaskQueue(bc, tc);
        this.task_queues.gelbooru = new TaskQueue(bc, tc);
        this.task_queues.sankaku = new TaskQueue(bc, tc);
        this.task_queues.eshuushuu = new TaskQueue(bc, tc);
        this.task_queues.zerochan = new TaskQueue(bc, tc);
        this.task_queues.anime_pictures = new TaskQueue(bc, tc);
        this.task_queues.pixiv = new TaskQueue(bc, tc);
        this.task_queues.reactor = new TaskQueue(bc, tc);
        this.task_queues.deviantart = new TaskQueue(bc, tc);
        this.task_queues.furaffinity = new TaskQueue(bc, tc);
        this.task_queues.artstation = new TaskQueue(bc, tc);
        this.task_queues.furrynetwork = new TaskQueue(bc, tc);
        this.task_queues.e621 = new TaskQueue(1, 5);
        this.task_queues.saucenao = new TaskQueue(31, 40);
        this.task_queues.twitter = new TaskQueue(0, 0);
        this.task_queues.kheina = new TaskQueue(bc, tc);
      });
    });
  },
  methods: {
    setPageLimit(page_limit) {
      this.currentFilesPage = 1;
      this.pageLimit = page_limit;
    },
    startDownloadProgress({ totalBytes, url, archiveTitle }) {
      let job = new Job({
        name: this.$t('jobs.downloading-archive', [archiveTitle]),
        vueComponent: this,
        taskTotalCount: totalBytes,
        ref: `dl-${url}`,
        onCancel: () => {
          window.network.cancelDownload(url);
        }
      });
      job.start();
    },
    setUpdaterProgress({ transferred, total }) {
      let job = this.jobs.find((j) => j.ref == 'updates-dl');
      if (!job) {
        job = new Job({
          name: this.$t('jobs.download_updates'),
          vueComponent: this,
          ref: 'updates-dl',
          taskTotalCount: total
        });
        job.start();
      }
      job.incrementProgress(transferred - job.solvedTaskCount);
    },
    setDownloadProgress({ url, transferredBytes }) {
      let job = this.jobs.find((j) => j.ref == `dl-${url}`);
      if (!job) {
        return;
      }
      job.incrementProgress(transferredBytes - job.solvedTaskCount);
    },
    startArchiveUnpacking({ archiveTitle, url }) {
      let job = new Job({
        name: this.$t('jobs.unpacking-archive', [archiveTitle]),
        vueComponent: this,
        ref: `unpack-${url}`,
        taskTotalCount: 1
      });
      job.start();
    },
    completeArchiveUnpacking({ url }) {
      let job = this.jobs.find((j) => j.ref == `unpack-${url}`);
      if (!job) {
        return;
      }
      job.incrementProgress(1);
    },
    openTagEditor(tag_id) {
      this.$refs.dialog_tag_editor.showComponent(tag_id);
    },
    openTagNamespaceEditor(tag_id) {
      this.$refs.dialog_tag_namespace_editor.showComponent(tag_id);
    },
    async searchFilesByTag(tag) {
      this.$refs.form_search_files.reset(tag?.locales?.[0]?.title);
      if (tag.namespace_id == tagNamespace.CREATOR) {
        this.showAuthorBlock(tag.id);
      }
    },
    async searchFilesByTagTitle(tag_title) {
      this.$refs.form_search_files.reset(tag_title);
    },
    async showAuthorBlock(tag_id) {
      this.authorUrls = await window.sqliteApi.getAuthorUrls(tag_id);
    },
    hideAuthorBlock() {
      this.authorUrls = [];
    },
    async searchFilesByTagTitles(tags_titles) {
      this.hideFile();
      this.hideAuthorBlock();
      this.filesInProgress = true;
      let files = await window.sqliteApi.findFilesByTags(tags_titles);
      for (let i = 0; i < files.length; i++) {
        if (i >= 1) {
          files[i]['prev'] = files[i - 1];
        }
        if (i <= files.length - 1) {
          files[i]['next'] = files[i + 1];
        }
      }
      this.filesInProgress = false;
      this.files = files;
    },
    async showFile(file) {
      if (typeof file === 'number') {
        file = await window.sqliteApi.getFile(file);
      }
      this.currentFile = file;
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
      /** @type string[] */
      let fileList = await window.fileApi.getNewFilenamesFromFolder(path);
      if (fileList.length == 0) {
        this.toast(this.$t('toast.no_new_files_in_folder'));
        return false;
      }
      let job = new Job({
        name: this.$t('jobs.import_folder'),
        vueComponent: this,
        taskTotalCount: fileList.length
      });
      job.start();
      for (let i = 0; i < fileList.length; i++) {
        if (!job?.isActive()) {
          break;
        }
        await window.fileApi.addFile(fileList[i]);
        job.incrementProgress(1);
      }
      this.searchFilesByTagTitle('fresh:5');
    },
    async openFile() {
      let file = await window.fileApi.openFile();
      if (!(file && file.filePaths && file.filePaths[0])) {
        return false;
      }
      let path = file.filePaths[0];
      console.log(`Chosen file ${path}`);
      await window.fileApi.addFile(path);
      this.toast(this.$t('toast.file_path_has_imported', [path]));
      this.searchFilesByTagTitle('fresh:5');
    },
    async importFromClipboard() {
      const tmpFilePath = await window.fileApi.saveTempFileFromClipboard();
      if (!tmpFilePath) {
        this.toast(this.$t('toast.clipboard_empty'));
        return false;
      }
      await window.fileApi.addFile(tmpFilePath);
      await window.fileApi.removeFile(tmpFilePath);
      this.toast(this.$t('toast.file_has_imported_from_clipboard'));
      this.searchFilesByTagTitle('fresh:5');
    },
    async importFileFromUrl() {
      if (!this.showDialogUrlForImport) {
        this.urlForImport = null;
        this.showDialogUrlForImport = true;
        return;
      }
      this.showDialogUrlForImport = false;
      if (!this.urlForImport) {
        this.toast(this.$t('toast.form_cancelled'));
        return false;
      }
      let analyzeResponse = await window.network.analyzeUrlForDl(
        this.urlForImport
      );
      console.log('analyzeResponse', analyzeResponse);
      const tmpFilePath = await window.fileApi.saveTempFileFromUrl(
        analyzeResponse.image_url
      );
      if (!tmpFilePath) {
        this.toast(
          this.$t('toast.cannot_upload_file_from_url', [this.urlForImport])
        );
        return false;
      }
      let { file_id } = await window.fileApi.addFile(tmpFilePath);
      await window.fileApi.removeFile(tmpFilePath);
      if (!file_id) {
        this.toast(
          this.$t('toast.cannot_copy_file_from_url', [this.urlForImport])
        );
        return false;
      }
      if (analyzeResponse.metadata) {
        new ParseTagResourceTask({
          resource_name: analyzeResponse?.resource?.name,
          file: { id: file_id },
          locale: analyzeResponse?.resource?.locale,
          url: analyzeResponse.source_url,
          noRemoteItem: analyzeResponse.metadata
        }).run();
      }
      console.log(this.$t('toast.file_has_imported', [this.urlForImport]));
      this.searchFilesByTagTitle('fresh:5');
    },
    async scanSelectedFiles() {
      let filesToScan = this.getCurrrentFiles().filter(
        (f) => f?.caption == constants.CAPTION_YET_NOT_SCANNED
      );
      if (filesToScan.length == 0) {
        this.toast(this.$t('main_window.no_files_to_scan'));
        return false;
      }

      let scanJob = new Job({
        name: this.$t('jobs.scan_selected_files'),
        taskTotalCount: filesToScan.length,
        vueComponent: this
      });
      scanJob.start();

      for (let i = 0; i < filesToScan.length; i++) {
        if (!scanJob?.isActive()) {
          break;
        }
        let file = filesToScan[i];
        try {
          console.log('Scan file: ', file);
          let recognized = await window.ocrApi.recognizeText(file['full_path']);
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
          filesToScan[i].caption = caption;
          if (this.currentFile && this.currentFile.id == file['id']) {
            this.$refs.dialog_show_file.setCaption(caption);
          }
          scanJob.incrementProgress(1);
        } catch (e) {
          console.error(e);
          this.toast(this.$t('toast.unknown_scan_error'));
          scanJob.destroy();
        }
      }
    },
    getCurrrentFiles() {
      return this.currentFile ? [this.currentFile] : this.files;
    },
    async getFilteredCurrentFiles(source_type) {
      const polledFileIds = await window.sqliteApi.getFileIdPolledWithSource(
        source_type
      );
      return this.getCurrrentFiles().filter(
        (f) => !polledFileIds.includes(f.id)
      );
    },
    async lookUpDups() {
      this.hideFile();
      let files = this.getCurrrentFiles();
      let job = new Job({
        name: this.$t('jobs.searching_dublicates'),
        taskTotalCount: files.length,
        vueComponent: this
      });
      job.start();
      let dups = [];

      for (let i = 0; i < files.length; i++) {
        if (!job?.isActive()) {
          break;
        }
        try {
          dups.push(
            ...(await window.sqliteApi.findDuplicateFiles(files[i].id))
          );
          job.incrementProgress(1);
        } catch (e) {
          console.error(e);
          this.toast(this.$t('toast.unknown_duplicate_error'));
          job.destroy();
        }
      }
      this.$refs.dialog_dublicates.showComponent(dups);
    },
    toast(message) {
      if (message.code) {
        message = this.$t(message.code);
      }
      this.statusMessage = message;
      this.isStatusMessageVisible = true;
    },
    afterTagsAdded() {
      if (this.currentFile) {
        this.$refs.dialog_show_file.reloadStuff();
      }
    },
    async loadTagsFromIQDB() {
      let strategy = getStrategy({
        key: await window.configApi.getConfig('tag_source_strategies'),
        onAfterDataAdded: () => {
          this.afterTagsAdded();
        }
      });
      let files = await this.getFilteredCurrentFiles(sourceTypes.IQDB);
      let similarityThreshold = await window.configApi.getConfig(
        'tag_source_threshold_iqdb'
      );
      if (similarityThreshold === undefined) {
        similarityThreshold = 0.8;
      }
      let job = new Job({
        name: this.$t('jobs.retrieving_tags_from_sources'),
        taskTotalCount: files.length,
        queue: this.task_queues.iqdb,
        vueComponent: this
      });
      job.start();
      for (let i = 0; i < files.length; i++) {
        let iqdbTask = new IqdbTask({
          file: files[i],
          similarityThreshold,
          strategy,
          task_queues: this.task_queues,
          job
        });
        this.task_queues.iqdb.addTask(iqdbTask);
      }
    },
    async loadTagsFromSaucenao() {
      let files = await this.getFilteredCurrentFiles(sourceTypes.SAUCENAO);
      let strategy = getStrategy({
        key: await window.configApi.getConfig('tag_source_strategies'),
        onAfterDataAdded: () => {
          this.afterTagsAdded();
        }
      });
      let similarityThreshold = await window.configApi.getConfig(
        'tag_source_threshold_saucenao'
      );
      if (similarityThreshold === undefined) {
        similarityThreshold = 80;
      }
      let job = new Job({
        name: this.$t('jobs.retrieving_tags_from_sources'),
        taskTotalCount: files.length,
        queue: this.task_queues.iqdb,
        vueComponent: this
      });
      job.start();
      for (let i = 0; i < files.length; i++) {
        let saucenaoTask = new SaucenaoTask({
          file: files[i],
          similarityThreshold,
          strategy,
          task_queues: this.task_queues,
          job
        });
        this.task_queues.saucenao.addTask(saucenaoTask);
      }
    },
    async loadTagsFromKheina() {
      let files = await this.getFilteredCurrentFiles(sourceTypes.KHEINA);
      let strategy = getStrategy({
        key: await window.configApi.getConfig('tag_source_strategies'),
        onAfterDataAdded: () => {
          this.afterTagsAdded();
        }
      });
      let similarityThreshold = await window.configApi.getConfig(
        'tag_source_threshold_kheina'
      );
      if (similarityThreshold === undefined) {
        similarityThreshold = 80;
      }
      let job = new Job({
        name: this.$t('jobs.retrieving_tags_from_sources'),
        taskTotalCount: files.length,
        queue: this.task_queues.iqdb,
        vueComponent: this
      });
      job.start();
      for (let i = 0; i < files.length; i++) {
        let task = new KheinaTask({
          file: files[i],
          similarityThreshold,
          strategy,
          task_queues: this.task_queues,
          job
        });
        this.task_queues.kheina.addTask(task);
      }
    },
    openPreferencesDialog() {
      this.$refs.dialog_preferences.showComponent();
    },
    redrawTag({ newLocales, tagId }) {
      this.tags = this.tags.map((t) => {
        if (t.id != tagId) {
          return t;
        }
        t.locales = newLocales;
        return t;
      });
      this.$refs.dialog_show_file.updateTag({ newLocales, tagId });
    },
    updateTagNamespace({ tag_id, namespace_id }) {
      this.tags = this.tags.map((t) =>
        t?.id == tag_id ? { ...t, namespace_id: namespace_id } : t
      );
      this.$refs.dialog_show_file.updateTagNamespace({ tag_id, namespace_id });
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
