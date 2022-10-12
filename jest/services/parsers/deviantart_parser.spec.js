const fs = require('fs');
const path = require('path');
const Parser =
  require('../../../src/services/parsers/deviantart_parser.js').default;

describe('Deviantart parser', () => {
  let parser = new Parser('');
  parser.getBuffer = () => {
    return JSON.parse(
      fs.readFileSync(path.join('jest', 'mocks', 'json', 'deviantart.json'))
    );
  };
  parser.fetchImageData = () => {
    return JSON.parse(
      fs.readFileSync(path.join('jest', 'mocks', 'json', 'deviantart-get.json'))
    );
  };
  parser.metadata = { author: 'cardbordtoaster' };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImage()).toEqual({
      height: 1397,
      url: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/7fd38edd-1368-433f-87f4-54ab0889358c/dfetx0s-f5185601-5aa8-406a-8147-c35581be80a3.png/v1/fill/w_1024,h_1397,q_80,strp/maiden_of_flames__craiyon__by_cardbordtoaster_dfetx0s-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTM5NyIsInBhdGgiOiJcL2ZcLzdmZDM4ZWRkLTEzNjgtNDMzZi04N2Y0LTU0YWIwODg5MzU4Y1wvZGZldHgwcy1mNTE4NTYwMS01YWE4LTQwNmEtODE0Ny1jMzU1ODFiZTgwYTMucG5nIiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.ZjqS3XTJBPykRpmnjCZsMOIcd4p25REeLxtChCHvWKY',
      width: 1024
    });
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual(null);
  });

  test('extract author url', async () => {
    expect(await parser.extractAuthorUrls()).toEqual([
      'https://www.deviantart.com/cardbordtoaster'
    ]);
  });

  test('extract title', async () => {
    expect(await parser.extractTitle()).toEqual('Maiden of Flames (Craiyon)');
  });

  test('is safe for work', async () => {
    expect(await parser.isSafeForWork()).toEqual(true);
  });

  test('extract tags', async () => {
    let tags = await parser.extractTags();
    expect(tags).toEqual([
      'ai',
      'dalle',
      'mech',
      'mecha',
      'aiart',
      'craiyon',
      'creator:cardbordtoaster'
    ]);
  });
});
