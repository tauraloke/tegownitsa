// eslint-disable-next-line no-unused-vars
import AbstractBasicParser from '@/services/parsers/abstract_basic_parser.js';
import sourceTypes from '../../config/source_type.json';

export async function run(_event, db, url, snake_source_key, file) {
  /** @type {AbstractBasicParser} */
  let source =
    new (require(`../../services/parsers/${snake_source_key}_parser.js`).default)(
      url
    );
  const result = await source.parse();
  await db.run(
    'INSERT INTO pollee_file_sources (file_id, source, tags_count) VALUES (?, ?, ?)',
    [file.id, sourceTypes[snake_source_key.toUpperCase()], result.tags.length]
  );
  return result;
}
