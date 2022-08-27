const fs = require('fs');
const path = require('path');
const Parser = require('../../../src/services/parsers/danbooru_parser.js').default;

test('Danbooru parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'html', 'danbooru.txt'));
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual([
    '1girl',
    'ass',
    'bangs',
    'bare_shoulders',
    'blue_hair',
    'blunt_bangs',
    'breasts',
    'cleavage',
    'closed_eyes',
    'colored_inner_hair',
    'cowboy_shot',
    'dress',
    'long_hair',
    'medium_breasts',
    'multicolored_hair',
    'own_hands_together',
    'purple_dress',
    'purple_hair',
    'side_slit',
    'smile',
    'solo',
    'standing',
    'very_long_hair',
    'creator:helloimtea',
    'series:genshin_impact',
    'character:columbina_(genshin_impact)',
    'meta:commentary_request',
    'meta:highres'
  ]);
});
