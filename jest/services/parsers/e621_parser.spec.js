const fs = require('fs');
const path = require('path');
const Parser = require('../../../src/services/parsers/e621_parser.js').default;

describe('E621 parser', () => {
  let parser = new Parser('');

  parser.getBuffer = () => {
    return fs.readFileSync(path.join('jest', 'mocks', 'json', 'e621.json'));
  };

  test('response object without exceptions', async () => {
    await expect(parser.parse()).resolves.not.toThrowError();
  });

  test('extract full url', async () => {
    expect(await parser.extractFullSizeImage()).toEqual({
      url: 'https://static1.e621.net/data/81/e7/81e75d26b9afb8b33acda7e08ba74f83.png',
      width: 1117,
      height: 1500
    });
  });

  test('extract source', async () => {
    expect(await parser.extractSourceUrls()).toEqual([
      'https://i.pximg.net/img-original/img/2017/03/31/00/00/01/62171703_p0.png',
      'https://www.pixiv.net/artworks/62171703'
    ]);
  });

  test('extract author url', async () => {
    expect(await parser.extractAuthorUrls()).toEqual(null);
  });

  test('extract title', async () => {
    expect(await parser.extractTitle()).toEqual(null);
  });

  test('is safe for work', async () => {
    expect(await parser.isSafeForWork()).toEqual(true);
  });

  test('extracts tags', async () => {
    let tags = await parser.extractTags();
    expect(tags).toEqual([
      '5_fingers',
      'baggy_clothing',
      'bar',
      'beverage',
      'biped',
      'black_hair',
      'blush',
      'border',
      'bottomwear',
      'breasts',
      'cabinet',
      'cafe',
      'clothed',
      'clothing',
      'container',
      'cup',
      'duo',
      'eyelashes',
      'eyes_closed',
      'feathered_wings',
      'feathers',
      'female',
      'fingers',
      'footwear',
      'fully_clothed',
      'gloves',
      'hair',
      'hair_over_eye',
      'handwear',
      'head_wings',
      'holding_object',
      'inside',
      'japanese',
      'leaning',
      'leaning_forward',
      'legwear',
      'light',
      'light_body',
      'light_skin',
      'long_sleeves',
      'looking_up',
      'mary_janes',
      'medium_breasts',
      'multicolored_body',
      'multicolored_feathers',
      'multicolored_hair',
      'neck_bow',
      'one_eye_obstructed',
      'open_mouth',
      'open_smile',
      'outside_border',
      'pink_body',
      'pink_feathers',
      'pink_tail',
      'pink_wings',
      'pleated_skirt',
      'pose',
      'raised_arm',
      'red_hair',
      'red_tail',
      'shadow',
      'shirt',
      'shoes',
      'short_hair',
      'shorts',
      'skirt',
      'small_waist',
      'smile',
      'socks',
      'steam',
      'string_bow',
      'sunlight',
      'suspended_in_midair',
      'tail_feathers',
      'tan_body',
      'tan_skin',
      'text',
      'thigh_highs',
      'thigh_socks',
      'topwear',
      'tray',
      'two_tone_body',
      'two_tone_feathers',
      'two_tone_wings',
      'white_body',
      'white_border',
      'white_feathers',
      'white_hair',
      'white_wings',
      'window',
      'wings',
      'yellow_eyes',
      'specie:alpaca_humanoid',
      'specie:animal_humanoid',
      'specie:avian',
      'specie:avian_humanoid',
      'specie:bird',
      'specie:bird_humanoid',
      'specie:camelid',
      'specie:camelid_humanoid',
      'specie:humanoid',
      'specie:ibis_humanoid',
      'specie:mammal',
      'specie:mammal_humanoid',
      'specie:pelecaniform',
      'specie:pelecaniform_humanoid',
      'specie:threskiornithid',
      'specie:threskiornithid_humanoid',
      'character:japanese_crested_ibis_(kemono_friends)',
      'character:suri_alpaca_(kemono_friends)',
      'series:kemono_friends',
      'creator:lalalalack',
      'meta:2017',
      'meta:digital_media_(artwork)',
      'meta:digital_painting_(artwork)',
      'meta:english_text',
      'meta:full-length_portrait',
      'meta:hi_res',
      'meta:lighting',
      'meta:portrait'
    ]);
  });
});
