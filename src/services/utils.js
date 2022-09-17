export function camelize(str) {
  return str
    .split('_')
    .map((str, index) =>
      index === 0 ? str : str[0].toUpperCase() + str.substring(1)
    )
    .join('');
}
export function randomDigit() {
  if (typeof window === 'undefined') {
    return require('crypto').randomInt(10);
  } else {
    return window.crypto.getRandomValues(new Uint32Array(1))[0] % 10;
  }
}
export function snakeize(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
export function swap(hash) {
  var result = {};
  for (let key in hash) {
    result[hash[key]] = key;
  }
  return result;
}
