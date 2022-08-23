module.exports = {
  camelize: (str) => {
    return str
      .split('_')
      .map((str, index) =>
        index === 0 ? str : str[0].toUpperCase() + str.substring(1)
      )
      .join('');
  },
  randomDigit: () => {
    return Math.floor(Math.random() * 10);
  },
  snakeize: (str) => {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  },
  swap: (hash) => {
    var result = {};
    for (let key in hash) {
      result[hash[key]] = key;
    }
    return result;
  }
};
