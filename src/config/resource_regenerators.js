module.exports = [
  { mask: /cdn\.donmai\.us/, name: 'danbooru' },
  { mask: /(files|assets)\.yande\.re/, name: 'yandere' },
  { mask: /[^a-z][a-z]\.sankakucomplex\.com/, name: 'sankaku' },
  { mask: /(s[0-9]|static)\.zerochan\.net/, name: 'zerochan' },
  { mask: /pximg\.net/, name: 'pixiv' },
  { mask: /konachan\.com/, name: 'konachan' }
];
