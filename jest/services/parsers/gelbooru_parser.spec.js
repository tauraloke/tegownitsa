const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/gelbooru_parser.js').default;

test('Gelbooru parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'html', 'gelbooru.txt'));
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual([
    '1girl',
    'ahoge',
    'black leotard',
    'blurry',
    'blurry background',
    'couch',
    'detached sleeves',
    'front slit',
    'full body',
    'gloves',
    'hair intakes',
    'headband',
    'indoors',
    'leotard',
    'long hair',
    'long sleeves',
    'lying',
    'on side',
    'parted lips',
    'pointy ears',
    'purple gloves',
    'purple hair',
    'purple skirt',
    'purple sleeves',
    'red eyes',
    'red headband',
    'shiny',
    'shiny hair',
    'skirt',
    'solo',
    'very long hair',
    'wooden floor',
    'series:sword art online',
    'character:yuuki (sao)',
    'meta:game cg'
  ]);
});
