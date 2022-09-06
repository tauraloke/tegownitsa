<template>
  <div id="app">
    <window-main />
  </div>
</template>

<script>
document.addEventListener(
  'contextmenu',
  function (event) {
    event = event || window.event;
    let msg = {
      srcUrl: event?.target?.src,
      tagId: event?.target
        ?.closest('.editable-tag-container')
        ?.getAttribute('data-tag-id'),
      x: event.x,
      y: event.y
    };
    window.busApi.showContextMenu(msg);
  },
  false
);

import WindowMain from '@/components/WindowMain.vue';
import { useTheme } from 'vuetify';

export default {
  name: 'App',
  components: { WindowMain },
  setup() {
    const theme = useTheme();
    return {
      theme,
      setTheme: (isDark) => {
        theme.global.name.value = isDark ? 'dark' : 'light';
      }
    };
  },
  mounted() {
    window.configApi.getConfig('lang').then((lang) => {
      this.$i18n.locale = lang;
    });
  }
};
</script>
