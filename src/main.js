import { createApp } from 'vue';
import App from './App.vue';
import Vuetify from './plugins/vuetify';
import VueI18n from 'vue-i18n';
import { loadFonts } from './plugins/webfontloader';
import i18n from './i18n.frontend';

loadFonts();

createApp(App).use(i18n).use(Vuetify).use(VueI18n).mount('#app');
