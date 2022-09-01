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

              <v-checkbox
                v-model="options.has_auto_updates"
                label="Enable auto updates"
              />
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
            <v-card-text>
              <v-select
                v-model="options.tag_source_strategies"
                hint="Strategies to enrich tag pool from outer search engines"
                :items="tagSourceStrategiesList"
                item-title="title"
                item-value="value"
                label="Strategy"
                variant="outlined"
                persistent-hint
                single-line
                class="mb-8"
              />
              <v-slider
                v-model="options.tag_source_threshold_iqdb"
                thumb-label="always"
                :min="0"
                :max="1"
              ></v-slider>
              <div class="text-caption mb-8">
                Similarity threshold for IQDB results (higher is a stronger
                filter)
              </div>
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card>
  </v-dialog>
</template>

<script>
import constants from '../config/constants.json';
import storeDefaults from '../.json_bus/store_defaults.json';
import tagSourceStrategies from '../config/tag_source_strategies.json';

let previousOptions = {};

export default {
  name: 'DialogPreferences',
  emits: ['option-changed'],
  data() {
    return {
      isDialogVisible: false,
      tab: 'application',
      options: {},
      isWatchersActive: false,
      tagSourceStrategiesList: [
        {
          title: 'Catch the first one',
          value: tagSourceStrategies.CATCH_FIRST_ONE
        },
        {
          title: 'Catch tags from any related resources',
          value: tagSourceStrategies.CATCH_ALL
        }
      ],
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
    options: {
      handler: function (newOptions) {
        if (!this.isWatchersActive) {
          return true;
        }
        console.log(newOptions);
        let changedKey = null;
        for (let key in previousOptions) {
          if (newOptions[key] != previousOptions[key]) {
            changedKey = key;
            previousOptions[key] = newOptions[key];
            break;
          }
        }
        if (!changedKey) {
          return true;
        }
        this._updateOption(changedKey, newOptions[changedKey]);
      },
      deep: true
    }
  },
  async mounted() {
    this.isWatchersActive = false;
    for (let key in storeDefaults) {
      let value = await window.configApi.getConfig(key);
      if (value === undefined) {
        value = storeDefaults[key];
      }
      if (key == 'tesseract_languages') {
        value = value.split(constants.TESSERACT_LANGUAGE_DIVIDER);
      }
      previousOptions[key] = value;
      this.options[key] = value;
    }
    this.isWatchersActive = true;
  },
  methods: {
    showComponent() {
      this.isDialogVisible = true;
    },
    _updateOption(key, value) {
      console.log('Update option', key, value);
      if (key === 'tesseract_languages') {
        if (typeof value === 'object') {
          value = Object.values(value).join(
            constants.TESSERACT_LANGUAGE_DIVIDER
          );
        } else {
          return;
        }
      }
      window.configApi.setConfig(key, value);
      this.$emit('option-changed', key, value);
    }
  }
};
</script>

<style scoped></style>
