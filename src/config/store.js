// Backend side

'use strict';
import Store from 'electron-store';
import defaults from './store_defaults.js';

export default new Store({
  defaults: defaults
});
