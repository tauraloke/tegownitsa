const fs = require('fs');
const path = require('path');
const Parser = require('../../../src/services/parsers/anime_pictures_parser.js');

test('Anime-Pictures parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(
      path.join('jest', 'mocks', 'html', 'animepictures.txt')
    );
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual([
    'single',
    'long hair',
    'tall image',
    'fringe',
    'highres',
    'hair between eyes',
    'purple eyes',
    'looking away',
    'red hair',
    'horn (horns)',
    'wind',
    'alternate costume',
    'text',
    'english',
    'girl',
    'dress',
    'white dress',
    'creator:tolu ya',
    'series:arknights',
    'character:surtr (arknights)'
  ]);
});
