const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/artstation_parser.js').default;

describe('Artstation parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(
      path.join('jest', 'mocks', 'json', 'artstation.json')
    );
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImage()).toEqual({
      url: 'https://cdnb.artstation.com/p/assets/images/images/012/877/109/large/victor-quaresma-pocketgems-wardragons-twilighthunter-final01.jpg?1547039100',
      width: 4321,
      height: 3000
    });
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual(null);
  });

  test('extract author url', async () => {
    expect(await parser.extractAuthorUrls()).toEqual([
      'https://www.artstation.com/quaresma'
    ]);
  });

  test('extract title', async () => {
    expect(await parser.extractTitle()).toEqual('War Dragons / Concept Art');
  });

  test('extract tags', async () => {
    let tags = await parser.extractTags();
    expect(tags).toEqual([
      'dragon',
      'concept art',
      'monster',
      'creature',
      'design',
      'work',
      'creator:quaresma'
    ]);
  });
});
