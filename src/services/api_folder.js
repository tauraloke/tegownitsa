const fs = require('fs');
const path = require('path');

class ApiFolder {
  constructor(snake_title) {
    this.snake_title = snake_title;
    this.snake_method_names = fs
      .readdirSync(path.join(__dirname, '..', 'api', this.snake_title))
      .filter((title) => title.match('.js'))
      .map((title) => title.split('.')[0]);
  }
  getMethod(snake_method_name) {
    return require(path.join(
      __dirname,
      '..',
      'api',
      this.snake_title,
      snake_method_name + '.js'
    )).run;
  }
}

module.exports = ApiFolder;
