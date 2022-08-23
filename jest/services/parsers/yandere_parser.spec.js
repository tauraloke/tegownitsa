const fs = require('fs');
const path = require('path');
const Parser = require('../../../src/services/parsers/yandere_parser.js');

test('Yandere parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'html', 'yandere.txt'));
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual([
    'seifuku',
    'sketch',
    'sweater',
    'creator:yokota takumi',
    'series:love live! nijigasaki high school idol club',
    'character:asaka karin',
    'character:emma verde',
    'character:konoe kanata',
    'character:mia taylor',
    'character:mifune shioriko',
    'character:miyashita ai',
    'character:nakasu kasumi',
    'character:ousaka shizuku',
    'character:takasaki yuu',
    'character:tennouji rina',
    'character:uehara ayumu',
    'character:yuuki setsuna',
    'character:zhong lanzhu'
  ]);
});
