const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/yandere_parser.js').default;

describe('Yandere parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'json', 'yandere.json'));
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImage()).toEqual({
      url: 'https://files.yande.re/image/ca7837f81e4a44baacb650c7f3d02210/yande.re%20741373%20blue_archive%20horns%20kanzarin%20sorasaki_hina%20thighhighs%20uniform.jpg',
      width: 1447,
      height: 2046
    });
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual([
      'https://www.pixiv.net/artworks/87632074'
    ]);
  });

  test('is safe for work', async () => {
    expect(await parser.isSafeForWork()).toEqual(false);
  });

  test('extracts tags', async () => {
    let tags = await parser.extractTags();
    expect(tags).toEqual([
      'series:blue_archive',
      'horns',
      'creator:kanzarin',
      'character:sorasaki_hina',
      'thighhighs',
      'uniform'
    ]);
  });
});
