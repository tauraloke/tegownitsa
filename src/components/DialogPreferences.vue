<template>
  <v-dialog v-model="isDialogVisible">
    <v-card class="d-flex flex-row">
      <v-tabs v-model="tab" direction="vertical" color="primary">
        <v-tab value="application">
          <v-icon start> mdi-application-cog-outline </v-icon>
          Application
        </v-tab>
        <v-tab value="tesseract">
          <v-icon start> mdi-cube-outline </v-icon>
          Tesseract OCR
        </v-tab>
        <v-tab value="tag_sources">
          <v-icon start> mdi-source-pull </v-icon>
          Tag sources
        </v-tab>
      </v-tabs>
      <v-window v-model="tab" direction="vertical">
        <v-window-item value="application">
          <v-card flat>
            <v-card-text>
              <v-switch
                v-model="options.dark_theme"
                hint="This toggles the dark theme"
                inset
                true-icon="mdi-weather-night"
                false-icon="mdi-weather-sunny"
                label="Theme Light/Dark"
                persistent-hint
              ></v-switch>
            </v-card-text>
          </v-card>
        </v-window-item>
        <v-window-item value="tesseract">
          <v-card flat>
            <v-card-text>
              <v-select
                v-model="options.tesseract_psm"
                hint="Page Segmentation Mode"
                :items="tesseractPSM"
                item-title="description"
                item-value="value"
                label="PSM"
                variant="outlined"
                persistent-hint
                single-line
                class="mb-4"
              />
              <v-select
                v-model="options.tesseract_oem"
                hint="Engine Mode"
                :items="tesseractOEM"
                item-title="description"
                item-value="value"
                label="OEM"
                variant="outlined"
                persistent-hint
                single-line
                class="mb-4"
              />
              <v-autocomplete
                v-model="options.tesseract_languages"
                :items="tesseractLanguages"
                outlined
                dense
                item-title="title"
                item-value="value"
                chips
                small-chips
                label="Languages"
                multiple
              />
            </v-card-text>
          </v-card>
        </v-window-item>
        <v-window-item value="tag_sources">
          <v-card flat>
            <v-card-text> tag sources options </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'WindowSettings',
  emits: ['option-changed'],
  data() {
    return {
      isDialogVisible: false,
      tab: 'application',
      options: {},
      isWatchersActive: false,
      tesseractPSM: [
        {
          description: 'OSD_ONLY',
          value: '0'
        },
        { description: 'AUTO_OSD', value: '1' },
        { description: 'AUTO_ONLY', value: '2' },
        { description: 'AUTO', value: '3' },
        { description: 'SINGLE_COLUMN', value: '4' },
        { description: 'SINGLE_BLOCK_VERT_TEXT', value: '5' },
        { description: 'SINGLE_BLOCK', value: '6' },
        { description: 'SINGLE_LINE', value: '7' },
        { description: 'SINGLE_WORD', value: '8' },
        { description: 'CIRCLE_WORD', value: '9' },
        { description: 'SINGLE_CHAR', value: '10' },
        { description: 'SPARSE_TEXT', value: '11' },
        { description: 'SPARSE_TEXT_OSD', value: '12' }
      ],
      tesseractOEM: [
        { description: 'TESSERACT_ONLY', value: 0 },
        { description: 'LSTM_ONLY', value: 1 },
        { description: 'TESSERACT_LSTM_COMBINED', value: 2 },
        { description: 'DEFAULT', value: 3 }
      ],
      tesseractLanguages: [
        { title: 'Chinese (trad.)', value: 'chi_tra' },
        { title: 'Chinese (trad., vertical)', value: 'chi_tra_vert' },
        { title: 'Chinese (simp.)', value: 'chi_sim' },
        { title: 'Chinese (simp., vertical)', value: 'chi_sim_vert' },
        { title: 'English', value: 'eng' },
        { title: 'French ', value: 'fra' },
        { title: 'Japanese', value: 'jpn' },
        { title: 'Japanese (vertical)', value: 'jpn_vert' },
        { title: 'Portuguese', value: 'por' },
        { title: 'Russian', value: 'rus' },
        { title: 'Spanish', value: 'spa' }
      ]
    };
  },
  watch: {
    'options.dark_theme': function (newValue, _oldValue) {
      if (!this.isWatchersActive || newValue === undefined) {
        return newValue;
      }
      window.configApi.setConfig('dark_theme', newValue);
      this.$emit('option-changed', 'dark_theme', newValue);
    },
    'options.tesseract_psm': function (newValue, _oldValue) {
      if (!this.isWatchersActive || newValue === undefined) {
        return newValue;
      }
      window.configApi.setConfig('tesseract_psm', newValue);
      this.$emit('option-changed', 'tesseract_psm', newValue);
    },
    'options.tesseract_oem': function (newValue, _oldValue) {
      if (!this.isWatchersActive || newValue === undefined) {
        return newValue;
      }
      window.configApi.setConfig('tesseract_oem', newValue);
      this.$emit('option-changed', 'tesseract_oem', newValue);
    },
    'options.tesseract_languages': function (newValue, _oldValue) {
      if (!this.isWatchersActive || newValue === undefined) {
        return newValue;
      }
      if (typeof newValue !== 'string') {
        newValue = Object.values(newValue).join(',');
      }
      console.log('rerere', newValue);
      window.configApi.setConfig('tesseract_languages', newValue);
      this.$emit('option-changed', 'tesseract_languages', newValue);
    }
  },
  async mounted() {
    this.isWatchersActive = false;
    this.options['dark_theme'] = await window.configApi.getConfig('dark_theme');
    this.options['tesseract_psm'] =
      (await window.configApi.getConfig('tesseract_psm')) || 3;
    this.options['tesseract_oem'] =
      (await window.configApi.getConfig('tesseract_oem')) || 3;
    this.options['tesseract_languages'] =
      (await window.configApi.getConfig('tesseract_languages')).split(',') ||
      'eng';
    this.isWatchersActive = true;
  },
  methods: {
    showComponent() {
      this.isDialogVisible = true;
    }
  }
};
</script>

<style scoped></style>
