const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/sankaku_parser.js').default;

describe('Sankaku parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'json', 'sankaku.json'));
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImageUrl()).toEqual(
      'https://s.sankakucomplex.com/data/3d/04/3d04f8a1a518fa9d7a40c4989303956b.jpg?e=1663148261&m=CRhDkP9KL_q734Zbr7WGbQ'
    );
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual([
      'https://skeb.jp/@1805C1875/works/1'
    ]);
  });

  test('extracts tags', async () => {
    let tags = await parser.extractTags();
    expect(tags).toEqual([
      'series:indie_virtual_youtuber',
      'creator:mirurukka',
      'meta:16:9_aspect_ratio',
      'meta:commission',
      'meta:skeb_commission',
      'meta:starry_background',
      '1boy',
      'galaxy',
      'looking_at_viewer',
      'male',
      'male_focus',
      'open_mouth',
      'pink_eyes',
      'shooting_star',
      'sky',
      'smile',
      'solo',
      'star_(sky)',
      'starry_sky',
      'white_hair',
      'yaezakura_ibuki',
      'genre:virtual_youtuber'
    ]);
  });
});
