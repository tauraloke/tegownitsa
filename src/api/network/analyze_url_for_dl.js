// eslint-disable-next-line no-unused-vars
import AbstractBasicParser from '@/services/parsers/abstract_basic_parser.js';
import url from 'url';
import tagResources from '../../config/tag_resources.js';

/**
 * @param {Electron.IpcMainInvokeEvent} _event
 * @param {sqlite3.Database} _db
 * @param {string} source_url
 */
export async function run(_event, _db, source_url) {
  let response = { image_url: source_url, source_url: source_url };
  let domain = url.parse(source_url).host;
  let resource = tagResources.find((r) => domain.match(r.mask));
  if (!resource) {
    return response;
  }
  try {
    /** @type {AbstractBasicParser} */
    let source =
      new (require(`../../services/parsers/${resource.name}_parser.js`).default)(
        source_url
      );
    response.metadata = await source.parse();
    response.resource = resource;
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
