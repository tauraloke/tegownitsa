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
  parser.metadata = { author: 'cardbordtoaster' };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImage()).toEqual(null);
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
