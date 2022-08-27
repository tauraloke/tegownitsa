class ApiFolder {
  constructor(snake_title, snake_method_names) {
    this.snake_title = snake_title;
    this.snake_method_names = snake_method_names;
  }
  getMethod(snake_method_name) {
    return require(`../api/${this.snake_title}/${snake_method_name}.js`).run;
  }
}

module.exports = ApiFolder;
