const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/sankaku_parser.js').default;

test('Sankaku parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'json', 'sankaku.json'));
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual([
    'series:indie_virtual_youtuber',
    'creator:mirurukka',
    'meta:16:9_aspect_ratio',
    'meta:commission',
    'meta:skeb_commission',
    'meta:starry_background',
    '1boy',
    'galaxy',
    'looking_at_viewer',
    'male',
    'male_focus',
    'open_mouth',
    'pink_eyes',
    'shooting_star',
    'sky',
    'smile',
    'solo',
    'star_(sky)',
    'starry_sky',
    'white_hair',
    'yaezakura_ibuki',
    'genre:virtual_youtuber'
  ]);
});
