<template>
  <div id="app">
    <window-main />
  </div>
</template>

<script>
document.addEventListener(
  'contextmenu',
  function (e) {
    e = e || window.event;
    let msg = {
      tagName: e?.target?.tagName || e?.srcElement?.tagName,
      text: e?.target?.textContent,
      href: e?.target?.getAttribute ? e?.target?.getAttribute('href') : ''
    };

    //if (msg.tagName.toLowerCase() === 'a' && msg.href.substring(0, 1) !== '#') {
    window.contextMenuApi.call(msg);
    //}
  },
  false
);

import WindowMain from '@/components/WindowMain.vue';

export default {
  name: 'App',
  components: { WindowMain }
};
</script>
