export function camelize(str) {
  return str
    .split('_')
    .map((str, index) =>
      index === 0 ? str : str[0].toUpperCase() + str.substring(1)
    )
    .join('');
}
export function randomDigit() {
  return Math.floor(Math.random() * 10);
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
export function applicationUserAgent() {
  const version = process.env.npm_package_version || '?';
  return `Tegownitsa: ${version} / Source: https://github.com/tauraloke/tegownitsa`;
}
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function prepareTag(title) {
  return title.trim().replace(',', '').replace(/\s/, '_');
}
