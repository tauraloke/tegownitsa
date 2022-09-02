const BYTE_COUNT = 63;

module.exports = {
  imageSimilarity: (threshold) =>
    Math.floor((1 - threshold / BYTE_COUNT) * 100),
  imageThreshold: (similarity) =>
    Math.floor((1 - similarity / 100) * BYTE_COUNT)
};
