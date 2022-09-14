const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/konachan_parser.js').default;

test('Konachan parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'json', 'konachan.json'));
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual([
    '2girls',
    'style:3d',
    'blonde_hair',
    'blush',
    'book',
    'brown_hair',
    'series:coca_cola',
    'computer',
    'drink',
    'game_console',
    'creator:ibara_dance',
    'character:inoue_takina',
    'kneehighs',
    'long_hair',
    'series:lycoris_recoil',
    'character:nishikigi_chisato',
    'red_eyes',
    'school_uniform',
    'short_hair',
    'skirt',
    'style:watermark',
    'wristwear'
  ]);
});
