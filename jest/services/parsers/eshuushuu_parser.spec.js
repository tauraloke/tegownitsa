const fs = require('fs');
const path = require('path');
const Parser = require('../../../src/services/parsers/eshuushuu_parser.js');

test('E-Shuushuu parser extracts tags', async () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(
      path.join('jest', 'mocks', 'html', 'eshuushuu.txt')
    );
  };
  let tags = await parser.extractTags();
  expect(tags).toEqual([
    'hat',
    'long hair',
    'red eyes',
    'white hair',
    'series:Arknights',
    'creator:Leria_V',
    'characters:Skadi'
  ]);
});
