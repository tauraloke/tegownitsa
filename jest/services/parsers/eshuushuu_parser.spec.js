const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/eshuushuu_parser.js').default;

describe('E-Shuushuu parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'html', 'eshuushuu.txt'));
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImage()).toEqual({
      url: 'https://e-shuushuu.net/images/2020-04-28-1024657.jpeg',
      width: 1650,
      height: 1000
    });
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual(null);
  });

  test('extract author url', async () => {
    expect(await parser.extractAuthorUrls()).toEqual(null);
  });

  test('extract title', async () => {
    expect(await parser.extractTitle()).toEqual(null);
  });

  test('extracts tags', async () => {
    let tags = await parser.extractTags();
    expect(tags).toEqual([
      'hat',
      'long hair',
      'red eyes',
      'white hair',
      'series:Arknights',
      'creator:Leria_V',
      'character:Skadi'
    ]);
  });
});
