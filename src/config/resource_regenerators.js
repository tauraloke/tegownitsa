module.exports = [
  { mask: /cdn\.donmai\.us\//, name: 'danbooru' },
  { mask: /(files|assets)\.yande\.re\//, name: 'yandere' },
  { mask: /[^a-z][a-z]\.sankakucomplex\.com\//, name: 'sankaku' },
  { mask: /(s[0-9]|static)\.zerochan\.net\//, name: 'zerochan' },
  { mask: /pximg\.net\//, name: 'pixiv' },
  { mask: /konachan\.com\//, name: 'konachan' },
  { mask: /gelbooru\.com\//, name: 'gelbooru' },
  {
    mask: /cloudfront\.net\/[a-z0-9]{2}\/[a-z0-9]+\/submission\/[0-9]{4}\/[0-9]{2}\//,
    name: 'furrynetwork'
  },
  { mask: /furaffinity\.net\//, name: 'furaffinity' }
];
