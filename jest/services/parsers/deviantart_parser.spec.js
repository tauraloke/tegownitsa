const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/deviantart_parser.js').default;

describe('Deviantart parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(
      path.join('jest', 'mocks', 'json', 'deviantart.json')
    );
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImageUrl()).toEqual(null);
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual(null);
  });

  test('extract author url', async () => {
    expect(await parser.extractAuthorUrls()).toEqual([
      'https://www.deviantart.com/robertartp'
    ]);
  });

  test('extract title', async () => {
    expect(await parser.extractTitle()).toEqual('Friends ');
  });

  test('Deviantart parser', async () => {
    let tags = await parser.extractTags();
    expect(tags).toEqual([
      'colors',
      'fox',
      'friends',
      'illustration',
      'painting',
      'squirrel',
      'watercolorart',
      'watercolorpainting',
      'winter',
      'italianartist',
      'animalillustration',
      'foxillustration',
      'friendshipis',
      'artistsondeviantart',
      'artistsoninstagram',
      'art',
      'illustrationartists',
      'creator:robertartp'
    ]);
  });
});
