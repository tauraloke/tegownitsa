const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/gelbooru_parser.js').default;

describe('Gelbooru parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'html', 'gelbooru.txt'));
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImage()).toEqual({
      url: 'https://img3.gelbooru.com/images/eb/f6/ebf68cdee25717cab3b6ab568439bb29.png',
      width: 720,
      height: 560
    });
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual([
      'https://saoub.fanadata.com/assets/characters/artwork/character_164_4.png'
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
      '1girl',
      'ahoge',
      'black leotard',
      'blurry',
      'blurry background',
      'couch',
      'detached sleeves',
      'front slit',
      'full body',
      'gloves',
      'hair intakes',
      'headband',
      'indoors',
      'leotard',
      'long hair',
      'long sleeves',
      'lying',
      'on side',
      'parted lips',
      'pointy ears',
      'purple gloves',
      'purple hair',
      'purple skirt',
      'purple sleeves',
      'red eyes',
      'red headband',
      'shiny',
      'shiny hair',
      'skirt',
      'solo',
      'very long hair',
      'wooden floor',
      'series:sword art online',
      'character:yuuki (sao)',
      'meta:game cg'
    ]);
  });
});
