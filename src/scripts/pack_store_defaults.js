// Create index file `api/contents.json` to navigate ApiConnector service around api calls with Webpack.
// Called as `npm run jsonize:store_defaults`, should be CommonJS.

const fs = require('fs');
const path = require('path');

// Pack Store defaults JSON
const storeDefaults = require('../config/store_defaults.js');
fs.writeFileSync(
  path.join(__dirname, '..', '.json_bus', 'store_defaults.json'),
  JSON.stringify(storeDefaults)
);
