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
            <v-card-text> tesseract options </v-card-text>
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
      isWatchersActive: false
    };
  },
  watch: {
    'options.dark_theme': function (newValue, _oldValue) {
      if (!this.isWatchersActive || newValue === undefined) {
        return newValue;
      }
      window.configApi.setConfig('dark_theme', newValue);
      this.$emit('option-changed', 'dark_theme', newValue);
    }
  },
  async mounted() {
    this.isWatchersActive = false;
    this.options['dark_theme'] = await window.configApi.getConfig('dark_theme');
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
