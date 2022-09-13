const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/deviantart_parser.js').default;

test('Deviantart parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(
      path.join('jest', 'mocks', 'json', 'deviantart.json')
    );
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual([
    'colors',
    'fox',
    'friends',
    'illustration',
    'painting',
    'squirrel',
    'watercolorart',
    'watercolorpainting',
    'winter',
    'italianartist',
    'animalillustration',
    'foxillustration',
    'friendshipis',
    'artistsondeviantart',
    'artistsoninstagram',
    'art',
    'illustrationartists',
    'creator:robertartp'
  ]);
});
