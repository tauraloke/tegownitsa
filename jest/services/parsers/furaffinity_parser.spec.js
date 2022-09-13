const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/furaffinity_parser.js').default;

test('Anime-Pictures parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(
      path.join('jest', 'mocks', 'html', 'furaffinity.txt')
    );
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual([
    'king',
    'cheetah',
    'charity',
    'painting',
    'feline',
    'felid',
    'cat',
    'creator:Inkfang'
  ]);
});
