<template>
  <v-dialog v-model="isDialogVisible" scrollable>
    <v-card>
      <v-toolbar>
        <v-toolbar-title style="text-align: center">
          {{
            duplicatedFiles.length > 0
              ? $t('main_window.duplicate_files')
              : $t('main_window.no_duplicates_found')
          }}
        </v-toolbar-title>
        <v-toolbar-items>
          <v-btn
            icon="mdi-close"
            :title="$t('button.back')"
            @click="hideComponent()"
          />
        </v-toolbar-items>
      </v-toolbar>
      <v-row v-for="file in duplicatedFiles" :key="file.id">
        <v-col class="d-flex child-flex justify-center" cols="12">
          <v-card elevation="4" class="ma-4">
            <v-img
              :data="{ id: file?.id }"
              :src="'file://' + file?.preview_path"
              aspect-ratio="1"
              :title="file.source_filename"
              width="140"
              contain
              class="bg-grey-lighten-2 pointer-clickable"
              @click="showFile(file)"
            />
            <v-card-text> {{ file.width }} x {{ file.height }} </v-card-text>
            <v-card-actions class="pt-0">
              <v-btn variant="text" color="red" @click="deleteFile(file.id)">
                {{ $t('button.remove') }}
              </v-btn>
            </v-card-actions>
          </v-card>
          <div class="pt-10">
            {{ $t('main_window.similarity') }}
            <br />
            {{ imageSimilarity(file.distance) }}%
          </div>
          <v-card elevation="4" class="ma-4">
            <v-img
              :data="{ id: file?.f2_id }"
              :src="'file://' + file?.f2_preview_path"
              :title="file.f2_source_filename"
              aspect-ratio="1"
              width="140"
              contain
              class="bg-grey-lighten-2 pointer-clickable"
              @click="showFile(file.f2_id)"
            />
            <v-card-text>
              {{ file.f2_width }} x {{ file.f2_height }}
            </v-card-text>
            <v-card-actions class="pt-0">
              <v-btn variant="text" color="red" @click="deleteFile(file.f2_id)">
                {{ $t('button.remove') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
  <v-dialog v-model="isShowConfirmDeleteFile" width="300px">
    <v-card>
      <v-card-text>
        {{ $t('main_window.remove_this_file') }}
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="text"
          color="red"
          @click="deleteFile(fileIdForDeletion)"
        >
          {{ $t('button.remove') }}
        </v-btn>
        <v-btn
          variant="text"
          color="grey"
          @click="isShowConfirmDeleteFile = false"
        >
          {{ $t('button.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { imageSimilarity } from '@/services/image_distance.js';

export default {
  name: 'DialogDublicates',
  emits: ['show-file', 'toast'],
  data() {
    return {
      isDialogVisible: false,
      duplicatedFiles: null,
      isShowConfirmDeleteFile: false,
      fileIdForDeletion: null
    };
  },
  methods: {
    async showComponent(dups) {
      this.isDialogVisible = true;
      this.duplicatedFiles = dups;
    },
    async runComponent() {},
    hideComponent() {
      this.isDialogVisible = false;
    },
    showFile(file) {
      this.$emit('show-file', file);
    },
    deleteFile(file_id) {
      if (!this.isShowConfirmDeleteFile) {
        this.isShowConfirmDeleteFile = true;
        this.fileIdForDeletion = file_id;
        return;
      } else {
        window.fileApi.removeFileById(file_id).then(() => {
          this.duplicatedFiles = this.duplicatedFiles.filter(
            (r) => r.id != file_id && r.f2_id != file_id
          );
          this.isShowConfirmDeleteFile = false;
          this.$emit('toast', this.$t('toast.file_has_removed'));
        });
      }
    },
    imageSimilarity(threshold) {
      return imageSimilarity(threshold);
    }
  }
};
</script>

<style></style>
