const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/furrynetwork_parser.js').default;

describe('Furrynetwork parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(
      path.join('jest', 'mocks', 'json', 'furrynetwork.json')
    );
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImage()).toEqual({
      url: 'https://d3gz42uwgl1r1y.cloudfront.net/su/sunny_way/submission/2022/08/baae5968c3f8ec3368a0da8619ba67da/2500x1500.jpg',
      width: null,
      height: null
    });
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual(null);
  });

  test('extract author url', async () => {
    expect(await parser.extractAuthorUrls()).toEqual([
      'https://furrynetwork.com/sunny_way/'
    ]);
  });

  test('extract title', async () => {
    expect(await parser.extractTitle()).toEqual('DnD Master');
  });

  test('is safe for work', async () => {
    expect(await parser.isSafeForWork()).toEqual(true);
  });

  test('extract tags', async () => {
    let tags = await parser.extractTags();
    expect(tags).toEqual([
      'sunnyway',
      'sunny-way',
      'digital-art',
      'artwork',
      'art',
      'finished-commission',
      'finishedcommission',
      'anthro',
      'male',
      'wolf',
      'canine',
      'human',
      'female',
      'god',
      'dragon',
      'unicorn',
      'magic',
      'dnd',
      'dnd-master',
      'master',
      'magician',
      'glowing',
      'book',
      'dnd-book',
      'dungeons-and-dragons',
      'smile',
      'join',
      'game',
      'fire',
      'clothed',
      'creator:sunny_way'
    ]);
  });
});
