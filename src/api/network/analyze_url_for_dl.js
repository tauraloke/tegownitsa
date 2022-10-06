// eslint-disable-next-line no-unused-vars
import AbstractBasicParser from '@/services/parsers/abstract_basic_parser.js';
import url from 'url';
import tagResources from '../../config/tag_resources.js';
import resourceRegenerators from '../../config/resource_regenerators.js';
// eslint-disable-next-line no-unused-vars
import AbstractRegenerator from '@/services/regenerators/abstract_regenerator.js';

/**
 * @param {Electron.IpcMainInvokeEvent} _event
 * @param {sqlite3.Database} _db
 * @param {string} source_url
 */
export async function run(_event, _db, source_url) {
  let response = { image_url: source_url, source_url: source_url };
  try {
    let domain = url.parse(source_url).host;
    let tagResourceRow = null;
    let regeneratorRow = resourceRegenerators.find((r) => domain.match(r.mask));
    if (regeneratorRow) {
      /** @type {AbstractRegenerator} */
      let regenerator =
        new (require(`../../services/regenerators/${regeneratorRow.name}_regenerator.js`).default)(
          source_url
        );
      source_url = await regenerator.regenerateUrl();
      response.source_url = source_url;
      tagResourceRow = tagResources.find((r) => r.name == regeneratorRow.name);
    }

    if (!tagResourceRow) {
      tagResourceRow = tagResources.find((r) => domain.match(r.mask));
    }
    if (!tagResourceRow) {
      return response;
    }

    /** @type {AbstractBasicParser} */
    let source =
      new (require(`../../services/parsers/${tagResourceRow.name}_parser.js`).default)(
        source_url
      );
    response.metadata = await source.parse();
    response.resource = tagResourceRow;
    if (
      response.metadata.fullSizeImage &&
      response.metadata.fullSizeImage.url
    ) {
      response.image_url = response.metadata.fullSizeImage.url;
    }
  } catch (e) {
    console.log('failed to parse', source_url, e);
  }
  return response;
}
