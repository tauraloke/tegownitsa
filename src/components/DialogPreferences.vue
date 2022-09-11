<template>
  <v-dialog v-model="isDialogVisible">
    <v-toolbar>
      <v-toolbar-title>
        {{ dialogTitle }}
      </v-toolbar-title>
      <v-toolbar-items>
        <v-btn
          icon="mdi-close"
          :title="$t('button.back')"
          @click="hideComponent()"
        />
      </v-toolbar-items>
    </v-toolbar>
    <v-card class="d-flex flex-row">
      <v-tabs v-model="tab" direction="vertical" color="primary">
        <v-tab value="application">
          <v-icon start> mdi-application-cog-outline </v-icon>
          {{ $t('settings.application') }}
        </v-tab>
        <v-tab value="tesseract">
          <v-icon start> mdi-cube-outline </v-icon>
          {{ $t('settings.tesseract_ocr') }}
        </v-tab>
        <v-tab value="tag_sources">
          <v-icon start> mdi-source-pull </v-icon>
          {{ $t('settings.tag_sources') }}
        </v-tab>
        <v-tab value="duplicates">
          <v-icon start> mdi-card-multiple-outline </v-icon>
          {{ $t('settings.duplicates') }}
        </v-tab>
      </v-tabs>
      <v-window v-model="tab" direction="vertical">
        <v-window-item value="application">
          <v-card flat>
            <v-card-text>
              <v-switch
                v-model="options.dark_theme"
                :hint="$t('settings.this_toggles_the_dark_theme')"
                inset
                true-icon="mdi-weather-night"
                false-icon="mdi-weather-sunny"
                :label="$t('settings.theme_light_dark')"
                persistent-hint
                class="mb-4"
              ></v-switch>

              <v-select
                v-model="options.lang"
                :hint="$t('settings.choose_interface_language')"
                :items="availableLanguages"
                item-title="title"
                item-value="value"
                :label="$t('settings.language')"
                variant="outlined"
                persistent-hint
                single-line
                class="mb-4"
              />

              <v-checkbox
                v-model="options.has_auto_updates"
                :label="$t('settings.enable_auto_updates')"
              />

              <v-checkbox
                v-model="options.import_exif_tags_as_tags"
                :label="$t('settings.import_exif_tags_as_tags')"
              />
            </v-card-text>
          </v-card>
        </v-window-item>
        <v-window-item value="tesseract">
          <v-card flat>
            <v-card-text>
              <v-select
                v-model="options.tesseract_psm"
                :hint="$t('settings.page_segmentation_mode')"
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
                :hint="$t('settings.engine_mode')"
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
                :label="$t('settings.tesseract_languages')"
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
                :hint="$t('settings.enrich_tags_strategies')"
                :items="tagSourceStrategiesList"
                item-title="title"
                item-value="value"
                :label="$t('settings.strategy')"
                variant="outlined"
                persistent-hint
                single-line
                class="mb-12"
              />
              <v-slider
                v-model="options.tag_source_threshold_iqdb"
                thumb-label="always"
                :min="0"
                :max="1"
              ></v-slider>
              <div class="text-caption mb-12">
                {{ $t('settings.iqdb_similarity_threshold') }}
              </div>

              <v-range-slider
                v-model="iqdbCooldownRange"
                step="1"
                min="10"
                max="120"
                thumb-label="always"
              ></v-range-slider>
              <div class="text-caption mb-12">
                {{ $t('settings.iqdb_cooldown') }}
              </div>

              <v-slider
                v-model="options.tag_source_threshold_saucenao"
                thumb-label="always"
                :min="0"
                :max="100"
              ></v-slider>
              <div class="text-caption mb-12">
                {{ $t('settings.saucenao_similarity_threshold') }}
              </div>

              <v-text-field
                v-model="options.tag_source_saucenao_api_key"
                :label="$t('settings.saucenao_key')"
                :hint="$t('settings.api_key_saucenao_hint')"
                class="mb-12"
              />

              <div>
                {{ $t('settings.saucenao_limit_message') }}
                <a
                  href="https://saucenao.com/user.php?page=search-usage"
                  target="_blank"
                >
                  {{ $t('settings.here') }}
                </a>
              </div>
            </v-card-text>
          </v-card>
        </v-window-item>
        <v-window-item value="duplicates">
          <v-card flat>
            <v-card-text>
              <v-slider
                v-model="options.image_similarity_threshold"
                thumb-label="always"
                :min="0"
                :max="100"
                class="mt-8"
              ></v-slider>
              <div class="text-caption mb-8">
                {{ $t('settings.similarity_threshold_hint') }}
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
import availableLanguages from '../config/available_languages.js';

let previousOptions = {};

export default {
  name: 'DialogPreferences',
  emits: ['option-changed'],
  data() {
    return {
      isDialogVisible: false,
      dialogTitle: this.$t('settings.dialog.title'),
      dialogTitleTimeout: null,
      tab: 'application',
      options: {},
      isWatchersActive: false,
      tagSourceStrategiesList: [
        {
          title: this.$t('settings.tag_source.strategies.catch_first'),
          value: tagSourceStrategies.CATCH_FIRST_ONE
        },
        {
          title: this.$t('settings.tag_source.strategies.catch_all'),
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
        { title: this.$t('settings.languages.chinese_trad'), value: 'chi_tra' },
        {
          title: this.$t('settings.languages.chinese_trad_vert'),
          value: 'chi_tra_vert'
        },
        {
          title: this.$t('settings.languages.chinese_simpl'),
          value: 'chi_sim'
        },
        {
          title: this.$t('settings.languages.chinese_simpl_vert'),
          value: 'chi_sim_vert'
        },
        { title: this.$t('settings.languages.english'), value: 'eng' },
        { title: this.$t('settings.languages.french'), value: 'fra' },
        { title: this.$t('settings.languages.japanese'), value: 'jpn' },
        {
          title: this.$t('settings.languages.japanese_vertical'),
          value: 'jpn_vert'
        },
        { title: this.$t('settings.languages.portuguese'), value: 'por' },
        { title: this.$t('settings.languages.russian'), value: 'rus' },
        { title: this.$t('settings.languages.spanish'), value: 'spa' }
      ],
      iqdbCooldownRange: [30, 60], // dumb init values
      availableLanguages: availableLanguages
    };
  },
  watch: {
    options: {
      handler: function (newOptions) {
        if (!this.isWatchersActive || !this.isDialogVisible) {
          return true;
        }
        let changedKey = null;
        for (let key in previousOptions) {
          let isChanged = false;
          if (key === 'tesseract_languages') {
            if (newOptions[key].join() != previousOptions[key].join()) {
              isChanged = true;
            }
          } else {
            if (newOptions[key] != previousOptions[key]) {
              isChanged = true;
            }
          }
          if (isChanged) {
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
    },
    iqdbCooldownRange: function (values) {
      this.options.tag_source_iqdb_bottom_cooldown = values[0];
      this.options.tag_source_iqdb_top_cooldown = values[1];
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
    this.iqdbCooldownRange = [
      this.options.tag_source_iqdb_bottom_cooldown,
      this.options.tag_source_iqdb_top_cooldown
    ];
    this.isWatchersActive = true;
  },
  methods: {
    showComponent() {
      this.dialogTitle = this.$t('settings.dialog.title');
      this.isDialogVisible = true;
    },
    hideComponent() {
      this.isDialogVisible = false;
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
      if (key === 'lang') {
        this.$root.$i18n.locale = value;
        window.busApi.changeLanguage(value);
      }
      window.configApi.setConfig(key, value);
      if (key == 'dark_theme') {
        this.$root.setTheme(value);
      }
      this.blinkTitle(this.$t('toast.preferences_saved'));
    },
    blinkTitle(msg) {
      this.dialogTitle = msg;
      clearTimeout(this.dialogTitleTimeout);
      this.dialogTitleTimeout = setTimeout(() => {
        this.dialogTitle = this.$t('settings.dialog.title');
      }, 4000);
    }
  }
};
</script>

<style scoped></style>
