const fs = require('fs');
const path = require('path');
const Parser = require('../../../src/services/parsers/sankaku_parser.js').default;

test('Sankaku parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'html', 'sankaku.txt'));
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual([
    ':/',
    '1girl',
    'arm garter',
    'asymmetrical legwear',
    'bare shoulders',
    'black legwear',
    'black ribbon',
    'black thighhighs',
    'blonde hair',
    'blush',
    'bow',
    'breasts',
    'candy',
    'clothing',
    'detached sleeves',
    'dress',
    'eyepatch',
    'female',
    'fishnets',
    'food',
    'garter straps',
    'gloves',
    'green eyes',
    'hair ornament',
    'hair over one eye',
    'hair ribbon',
    'hand up',
    'holding',
    'holding candy',
    'holding food',
    'holding lollipop',
    'holding object',
    'legwear',
    'lingerie',
    'lollipop',
    'long hair',
    'looking at viewer',
    'medium breasts',
    'pantyhose',
    'purple bow',
    'purple dress',
    'ribbon',
    'single leg pantyhose',
    'single thighhigh',
    'solo',
    'thighhighs',
    'two side up',
    'creator:yukiri (l ii)',
    'series:genshin impact',
    'character:fischl (genshin impact)'
  ]);
});
