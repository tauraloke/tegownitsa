// Service script to catch danbooru tag categories.

/* tag categories: 
0	General
1	Artist
3	Copyright
4	Character
5	Meta
*/

const fetch = require('node-fetch');
const fs = require('fs');

const tags = require('./danbooru_tag_list.json');
var result = [];
const TAG_BATCH_SIZE = 20; // Cannot request more tags from a server.

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function enrich_tags(_tags) {
  let search = _tags
    .map((t) => `search[name_array][]=${encodeURIComponent(t)}`)
    .join('&');
  let str = `https://danbooru.donmai.us/tags?format=json&${search}`;
  let r = JSON.parse(await (await fetch(str)).text());
  console.log(`get N tags from ${_tags.length}:`, r.length);
  for (let i in r) {
    let tag = r[i];
    result.push({
      name: tag.name,
      id: tag.id,
      post_count: tag.post_count,
      category: tag.category
    });
  }
}

for (let i = 0; i < tags.length; i += TAG_BATCH_SIZE) {
  let tag_slice = tags.slice(i, i + TAG_BATCH_SIZE);
  await enrich_tags(tag_slice);
  console.log('from tag...', tag_slice[0]);
  console.log('---- result length ----- ', result.length);
  await delay(3030);
}

fs.writeFileSync('result.json', JSON.stringify(result));
