export default class BaseStrategy {
  constructor() {}
  // @Abstract
  run() {
    throw 'Implement method "run()"!';
  }
}
