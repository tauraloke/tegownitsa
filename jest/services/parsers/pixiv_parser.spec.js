const fs = require('fs');
const path = require('path');
const Parser = require('../../../src/services/parsers/pixiv_parser.js').default;

describe('Pixiv parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'json', 'pixiv.json'));
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImageUrl()).toEqual(
      'https://i.pximg.net/img-original/img/2015/01/21/00/05/34/48285353_p0.png'
    );
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual(null);
  });

  test('extract author url', async () => {
    expect(await parser.extractAuthorUrls()).toEqual([
      'https://www.pixiv.net/en/users/9639041'
    ]);
  });

  test('extract title', async () => {
    expect(await parser.extractTitle()).toEqual('逆');
  });

  test('extracts tags', async () => {
    let tags = await parser.extractTags();
    expect(tags).toEqual([
      'clouds',
      'Puella Magi Madoka Magica',
      'reflection pool',
      'girl',
      'Madoka Kaname',
      '治疗颈椎病',
      'ultimate madoka',
      'inngawokoetehigekiwotatsuinori',
      'Madoka☆Magica 10000+ bookmarks',
      'Starry Sky Dress',
      'creator:midii'
    ]);
  });
});
