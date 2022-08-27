export async function run(_event, _db, url, snake_source_key) {
  let sourceClass =
    require(`../../services/parsers/${snake_source_key}_parser.js`).default;
  return await new sourceClass(url).extractTags();
}
