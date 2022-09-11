const fs = require('fs');
const path = require('path');
const Parser = require('../../../src/services/parsers/pixiv_parser.js').default;

test('Sankaku parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'json', 'pixiv.json'));
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual([
    'clouds',
    'Puella Magi Madoka Magica',
    'reflection pool',
    'girl',
    'Madoka Kaname',
    '治疗颈椎病',
    'ultimate madoka',
    'inngawokoetehigekiwotatsuinori',
    'Madoka☆Magica 10000+ bookmarks',
    'Starry Sky Dress',
    'creator:midii'
  ]);
});
