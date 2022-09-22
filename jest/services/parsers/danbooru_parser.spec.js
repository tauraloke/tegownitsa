const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/danbooru_parser.js').default;

describe('Danbooru parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'json', 'danbooru.json'));
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImage()).toEqual({
      url: 'https://cdn.donmai.us/original/e2/33/e233ff890e0664f1a0051b86d10038f0.png',
      width: 619,
      height: 1200
    });
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual([
      'https://i.pximg.net/img-original/img/2022/08/18/03/50/04/100569046_p0.png'
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
      'ass',
      'bangs',
      'bare_shoulders',
      'blue_hair',
      'blunt_bangs',
      'breasts',
      'cleavage',
      'closed_eyes',
      'colored_inner_hair',
      'cowboy_shot',
      'dress',
      'long_hair',
      'medium_breasts',
      'multicolored_hair',
      'own_hands_together',
      'purple_dress',
      'purple_hair',
      'side_slit',
      'smile',
      'solo',
      'standing',
      'very_long_hair',
      'character:columbina_(genshin_impact)',
      'series:genshin_impact',
      'creator:helloimtea',
      'meta:commentary_request',
      'meta:highres'
    ]);
  });
});
