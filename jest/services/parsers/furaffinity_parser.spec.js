const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/furaffinity_parser.js').default;

describe('Furaffinity parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return fs.readFileSync(
      path.join('jest', 'mocks', 'html', 'furaffinity.txt')
    );
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImage()).toEqual({
      url: 'https://d.furaffinity.net/art/inkfang/1594246554/1594246554.inkfang_king_cheetah_print_copy.jpg',
      width: 1280,
      height: 1280
    });
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual(null);
  });

  test('extract author url', async () => {
    expect(await parser.extractAuthorUrls()).toEqual([
      'https://www.furaffinity.net/user/inkfang/'
    ]);
  });

  test('extract title', async () => {
    expect(await parser.extractTitle()).toEqual('king cheetah');
  });

  test('extracts tags', async () => {
    let tags = await parser.extractTags();
    expect(tags).toEqual([
      'king',
      'cheetah',
      'charity',
      'painting',
      'feline',
      'felid',
      'cat',
      'creator:Inkfang'
    ]);
  });
});
