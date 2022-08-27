const fs = require('fs');
const path = require('path');
const Parser = require('../../../src/services/parsers/zerochan_parser.js').default;

test('Zerochan parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'html', 'zerochan.txt'));
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual(['creator:Pixiv Id 18833499', 'character:Shu Yamino']);
});
