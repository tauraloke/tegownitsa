const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/zerochan_parser.js').default;

describe('Zerochan parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'html', 'zerochan.txt'));
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImage()).toEqual({
      url: 'https://static.zerochan.net/Shu.Yamino.full.3734266.jpg',
      width: 1378,
      height: 2039
    });
  });

  test('extract author url', async () => {
    expect(await parser.extractAuthorUrls()).toEqual([
      'https://www.pixiv.net/en/users/18833499'
    ]);
  });

  test('is safe for work', async () => {
    expect(await parser.isSafeForWork()).toEqual(true);
  });

  test('extracts tags', async () => {
    let tags = await parser.extractTags();
    expect(tags).toEqual(['creator:Pixiv Id 18833499', 'character:Shu Yamino']);
  });
});
