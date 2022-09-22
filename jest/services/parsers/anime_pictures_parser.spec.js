const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/anime_pictures_parser.js').default;

describe('Anime-Pictures parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(
      path.join('jest', 'mocks', 'html', 'animepictures.txt')
    );
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImage()).toEqual({
      url: 'https://anime-pictures.net/pictures/get_image/767528-1981x2892-arknights-surtr+%28arknights%29-tolu+ya-single-long+hair-tall+image.jpeg',
      width: 1981,
      height: 2892
    });
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual(null);
  });

  test('extract author url', async () => {
    expect(await parser.extractAuthorUrls()).toEqual([
      'https://www.pixiv.net/users/42749561',
      'https://twitter.com/Toluya413',
      'https://toluya661.lofter.com'
    ]);
  });

  test('extract title', async () => {
    expect(await parser.extractTitle()).toEqual(null);
  });

  test('extracts tags', async () => {
    let tags = await parser.extractTags();
    expect(tags).toEqual([
      'single',
      'long hair',
      'tall image',
      'fringe',
      'highres',
      'hair between eyes',
      'purple eyes',
      'looking away',
      'red hair',
      'horn (horns)',
      'wind',
      'alternate costume',
      'text',
      'english',
      'girl',
      'dress',
      'white dress',
      'creator:tolu ya',
      'series:arknights',
      'character:surtr (arknights)'
    ]);
  });
});
