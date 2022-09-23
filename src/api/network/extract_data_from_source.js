// eslint-disable-next-line no-unused-vars
import AbstractBasicParser from '@/services/parsers/abstract_basic_parser.js';

export async function run(_event, _db, url, snake_source_key) {
  /** @type {AbstractBasicParser} */
  let source =
    new (require(`../../services/parsers/${snake_source_key}_parser.js`).default)(
      url
    );
  return await source.parse();
}
