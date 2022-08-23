const fs = require('fs');
const path = require('path');
const Parser = require('../../../src/services/parsers/zerochan_parser.js');

test('Zerochan parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'html', 'zerochan.html'));
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual(['creator:Pixiv Id 18833499', 'character:Shu Yamino']);
});
