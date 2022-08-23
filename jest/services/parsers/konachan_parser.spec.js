const fs = require('fs');
const path = require('path');
const Parser = require('../../../src/services/parsers/konachan_parser.js');

test('Konachan parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'html', 'konachan.txt'));
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual([
    '2girls',
    'blonde_hair',
    'blue_eyes',
    'demon',
    'drink',
    'green_eyes',
    'horns',
    'long_hair',
    'maid',
    'pink_hair',
    'pointed_ears',
    'short_hair',
    'towel',
    'waitress',
    'creator:goroo_(eneosu)',
    'series:hololive',
    'character:takane_lui',
    'character:yuzuki_choco'
  ]);
});
