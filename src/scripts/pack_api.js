// Create index file `api/contents.json` to navigate ApiConnector service around api calls with Webpack.
// Called as `npm run jsonize:api`, should be CommonJS.

const fs = require('fs');
const path = require('path');
let result = {};
let apiDir = fs.readdirSync(path.join(__dirname, '..', 'api'), {
  withFileTypes: true
});
apiDir.forEach((dir) => {
  if (!dir.isDirectory()) {
    return false;
  }
  let files = fs.readdirSync(path.join(__dirname, '..', 'api', dir.name), {
    withFileTypes: true
  });
  result[dir.name] = [];
  files.forEach((file) => {
    if (file.isFile && file.name != 'index.js') {
      result[dir.name].push(file.name.replace(/.js$/, ''));
    }
  });
});
fs.writeFileSync(
  path.join(__dirname, '..', 'api', 'contents.json'),
  JSON.stringify(result)
);
