import AbstractRegenerator from './abstract_regenerator.js';
import fetch from 'node-fetch';
import { applicationUserAgent, sleep } from '../utils.js';
import { load } from 'cheerio';
import config from '../../config/store.js';

export default class FuraffinityRegenerator extends AbstractRegenerator {
  /**
   * @returns {CheerioAPI}
   */
  async getHtmlParser(url) {
    return load(await this.getBuffer(url));
  }
  /**
   * @param {string} url
   * @returns {string}
   */
  async getBuffer(url) {
    return await (
      await fetch(url, {
        headers: { 'User-Agent': applicationUserAgent() },
        cookie: this.getCookie(),
        method: 'GET'
      })
    ).text();
  }
  /**
   * @returns {string}
   */
  getCookie() {
    return config.get('furaffinity_cookies');
  }
  /**
   * @returns {Promise<string>}
   */
  async regenerateUrl() {
    // for previews in galleries
    let matchIcon = this.url.match(/furaffinity\.net\/([0-9]+)@/);
    if (matchIcon) {
      let item_id = matchIcon[1];
      return `https://www.furaffinity.net/view/${item_id}/`;
    }
    // for fullsize and preview
    let matchFullsized = this.url.match(
      /furaffinity\.net\/art\/([0-9a-z]+)\/([0-9]+)\//
    );
    let author = matchFullsized[1];
    let image_id = matchFullsized[2];
    let has_next = true;
    let item_id = null;
    let limit = 200;
    let page = 1;
    do {
      let galleryPageUrl = `https://www.furaffinity.net/gallery/${author}/${page}/?`;
      console.log('Looking page for item_id', galleryPageUrl);
      let $ = await this.getHtmlParser(galleryPageUrl);
      $('a').each(function (i, el) {
        try {
          let src = $($(el).find('img').get()[0]).attr('src');
          let srcIconMatch = src.match(
            `furaffinity\\.net\\/([0-9]+)@[0-9]+-${image_id}\\.`
          );
          console.log(src, srcIconMatch); //TODO: remove
          item_id = srcIconMatch[1];
        } catch (error) {
          1;
        }
      });
      if (item_id) {
        break;
      }
      page = page + 1;
      if (page > limit) {
        break;
      }
      has_next =
        $(
          '#columnpage > div > section > div > div > div:nth-child(4) > div:nth-child(3) > form > button'
        ).length > 0;
      //await sleep(1000);
    } while (has_next);
    if (!item_id) {
      throw {
        message: 'Cannot find image in gallery',
        author: author,
        image_id: image_id,
        url: this.url
      };
    }
    return `https://www.furaffinity.net/view/${item_id}/`;
  }
}
