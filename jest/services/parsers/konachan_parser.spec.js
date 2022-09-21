const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/konachan_parser.js').default;

describe('Konachan parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'json', 'konachan.json'));
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImageUrl()).toEqual(
      'https://konachan.com/image/cf6bc19a7784715bc3a79841a5e26a9e/Konachan.com%20-%20347126%202girls%203d%20blonde_hair%20blush%20book%20brown_hair%20coca_cola%20computer%20drink%20ibara_dance%20kneehighs%20long_hair%20red_eyes%20short_hair%20skirt%20watermark%20wristwear.jpg'
    );
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual([
      'https://www.pixiv.net/en/artworks/101204641'
    ]);
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
      '2girls',
      'style:3d',
      'blonde_hair',
      'blush',
      'book',
      'brown_hair',
      'series:coca_cola',
      'computer',
      'drink',
      'game_console',
      'creator:ibara_dance',
      'character:inoue_takina',
      'kneehighs',
      'long_hair',
      'series:lycoris_recoil',
      'character:nishikigi_chisato',
      'red_eyes',
      'school_uniform',
      'short_hair',
      'skirt',
      'style:watermark',
      'wristwear'
    ]);
  });
});
