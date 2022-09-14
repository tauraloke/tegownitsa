const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/yandere_parser.js').default;

test('Yandere parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'json', 'yandere.json'));
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual([
    'series:ao_no_exorcist',
    'character:kamiki_izumo',
    'megane',
    'character:moriyama_shiemi',
    'character:okumura_rin',
    'character:okumura_yukio',
    'seifuku',
    'character:shima_renzou',
    'skirt_lift',
    'tagme',
    'thighhighs'
  ]);
});
