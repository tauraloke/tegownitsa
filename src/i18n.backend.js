// TODO: экспортировать подключение к
import config from './config/store.js';

let language = 'en';
let fallbackLanguage = 'en';
let falldownLocales = [];
let locales = [];

function dig(path, nestedData) {
  if (path && path[0] && nestedData[path[0]]) {
    if (typeof nestedData[path[0]] === 'string') {
      return nestedData[path[0]];
    }
    if (typeof nestedData[path[0]] === 'object') {
      return dig(path.splice(1), nestedData[path[0]]);
    }
    return null;
  }
  return null;
}

export default {
  init: () => {
    try {
      language = config.get('lang') || 'en';
      fallbackLanguage = 'en';
      locales = require(`./locales/${language}.json`);
      falldownLocales = require(`./locales/${fallbackLanguage}.json`);
      return true;
    } catch (error) {
      console.log('Cannot init 18n backend loader', error);
      return false;
    }
  },
  changeLanguage: (newLanguage) => {
    language = newLanguage;
    try {
      locales = require(`./locales/${language}.json`);
      return true;
    } catch (error) {
      console.log(`Cannot switch locale to '${newLanguage}'`, error);
      return false;
    }
  },
  t: (string) => {
    let path = string.split('.');

    let result = dig(path, locales) || dig(path, falldownLocales) || string;

    return result;
  }
};
