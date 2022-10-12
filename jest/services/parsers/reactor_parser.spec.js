const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/reactor_parser.js').default;

describe('Reactor parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'json', 'reactor.json'));
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImage()).toEqual({
      height: 1600,
      url: 'https://img2.joyreactor.cc/pics/post/full/isvoc-artist-Dragon-%D0%9C%D0%B8%D1%84%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B5-%D1%81%D1%83%D1%89%D0%B5%D1%81%D1%82%D0%B2%D0%B0-7631568.png',
      width: 1070
    });
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual(null);
  });

  test('extract author url', async () => {
    expect(await parser.extractAuthorUrls()).toEqual(null);
  });

  test('extract title', async () => {
    expect(await parser.extractTitle()).toEqual('The Crimson Hourglass');
  });

  test('is safe for work', async () => {
    expect(await parser.isSafeForWork()).toEqual(true);
  });

  test('extracts tags', async () => {
    let tags = await parser.extractTags();
    expect(tags).toEqual([
      'creator:isvoc',
      'artist',
      'Dragon',
      'Мифические существа',
      'Fantasy',
      'art'
    ]);
  });
});
