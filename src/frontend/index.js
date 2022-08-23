/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
// Front layer
const CAPTION_NOT_FOUND = '[NO CAPTION FOUND]';

let files = [];
let currentFile = null;
let tags = [];
let currentTag = null;

function showActionStroke(message) {
  console.log('STATE: ', message);
  document.getElementById('actionStroke').textContent = message;
}
function showTags(_tags) {
  document.getElementById('tags').innerHTML = '';
  if (currentFile && currentFile['id']) {
    _renderFileTags(_tags);
  } else {
    _renderCollectionTags(_tags);
  }

  tags = _tags;
}
function _renderFileTags(_tags) {
  let form = document.createElement('p');
  form.innerHTML =
    `<input type='text' value='' placeholder='type tag' id='add_tag_title' />` +
    `<input type='text' value='en' id='add_tag_locale' placeholder='en' maxlength='2'>` +
    `<button class='add_tag'>add tag</button>`;
  document.getElementById('tags').appendChild(form);

  let groups = {};
  _tags.forEach(async (tag) => {
    let p = document.createElement('p');
    p.setAttribute('data-id', tag['id']);
    let title = Object.values(tag['locales']).join(' / ');
    p.innerHTML =
      `<a class='tag_search'>${title}</a>` +
      ` <span title='files with the tag'>(${tag['file_count']})</span>` +
      ` <button class='remove_tag' data-file-tag-id='${tag['file_tag_id']}'>[-]</button>` +
      ` <button class='edit_tag' data-tag-id='${tag['id']}' title='edit tag'>[e]</button>`;

    if (!groups[tag['namespace_id']]) {
      groups[tag['namespace_id']] = document.createElement('div');
      let namespaceTitle = await window.constants.getTagNamespaceById(
        tag['namespace_id']
      );
      groups[
        tag['namespace_id']
      ].innerHTML = `<h4 class='tag_group_title'>${namespaceTitle}</h4>`;
    }

    groups[tag['namespace_id']].appendChild(p);
  });
  for (let i in groups) {
    document.getElementById('tags').append(groups[i]);
  }
}
async function _renderCollectionTags(_tags) {
  let groups = {};
  _tags.forEach(async (tag) => {
    let p = document.createElement('p');
    p.setAttribute('data-id', tag['id']);
    let title = Object.values(tag['locales']).join(' / ');
    p.innerHTML =
      `<a class='tag_search'>${title}</a>` +
      ` <span title='files with the tag'>(${tag['file_count']})</span>` +
      ` <button class='edit_tag' data-tag-id='${tag['id']}' title='edit tag'>[e]</button>`;

    if (!groups[tag['namespace_id']]) {
      groups[tag['namespace_id']] = document.createElement('div');
      let namespaceTitle = await window.constants.getTagNamespaceById(
        tag['namespace_id']
      );
      groups[
        tag['namespace_id']
      ].innerHTML = `<h4 class='tag_group_title'>${namespaceTitle}</h4>`;
    }

    groups[tag['namespace_id']].appendChild(p);
  });
  for (let i in groups) {
    document.getElementById('tags').append(groups[i]);
  }
}
function showFiles(_files) {
  document.getElementById('files').innerHTML = '';
  _files.forEach((file) => {
    let div = document.createElement('div');
    div.setAttribute('data-id', file['id']);
    div.className = 'gallery_block';
    div.innerHTML = `<img src='${file['preview_path']}' title='${file['source_filename']}' class='gallery_image' data-id='${file['id']}' />`;
    document.getElementById('files').appendChild(div);
  });
  files = _files;
}
function showDupFiles(_files) {
  document.getElementById('files').innerHTML = '';
  _files.forEach((file) => {
    let div = document.createElement('div');
    div.setAttribute('data-id', file['id']);
    div.className = 'gallery_block';
    let similarity = Math.floor((1 - file['distance'] / 63) * 100);
    div.innerHTML =
      `<img src='${file['preview_path']}' class='gallery_image' data-id='${file['id']}' />` +
      `(${file['width']}x${file['height']})` +
      `<button class='delete_file' data-id='${file['id']}' title='drop first file'>[d]</button>` +
      `<img src='${file['f2_preview_path']}' class='gallery_image' data-id='${file['f2_id']}' />` +
      `(${file['f2_width']}x${file['f2_height']})` +
      `<button class='delete_file' data-id='${file['f2_id']}' title='drop second file'>[d]</button>` +
      ` (sim. ${similarity})%`;
    document.getElementById('files').appendChild(div);
  });
  files = _files;
}
function showFileInfo(file) {
  document.getElementById('file_info').style.display = 'none';
  document.getElementById('file_info_header').innerHTML =
    file['source_filename'];
  document.getElementById('file_info_img').src = file['full_path'];
  document.getElementById(
    'file_info_caption_container'
  ).innerHTML = `<textarea id="file_info_caption">${file['caption']}</textarea>`;

  let exifBlock = '';
  if (file['exif_create_date']) {
    let dateCreate = new Date(file['exif_create_date'] * 1000).toLocaleString(
      'ru'
    );
    exifBlock += `<div>Create date: ${dateCreate}</div>`;
  }
  if (file['exif_latitude'] && file['exif_longitude']) {
    let coords = `<a href='https://www.google.com/maps/place/${file['exif_latitude']},${file['exif_longitude']}' target='_blank'>${file['exif_latitude']},${file['exif_longitude']}</a>`;
    exifBlock += `<div>Coordinates: ${coords}</div>`;
  }
  if (file['exif_make']) {
    exifBlock += `<div>Maked by: ${file['exif_make']} ${file['exif_model']}</div>`;
  }

  document.getElementById('file_info_exif').innerHTML = exifBlock;
  if (file.urls && file.urls.length > 0) {
    document.getElementById('file_info_sources').innerHTML =
      `<h4>Sources</h4>` +
      `<ul>` +
      file.urls
        .map((_url) => `<li><a href="${_url}" target="_blank">${_url}</a></li>`)
        .join('\n') +
      `</ul>`;
  }

  document.getElementById('file_info').style.display = 'block';
  currentFile = file;
}
function hideFileInfo() {
  document.getElementById('file_info').style.display = 'none';
  currentFile = null;
}

function searchString() {
  return document.getElementById('search_string').value;
}
function setSearchString(value) {
  document.getElementById('search_string').value = value;
}
async function searchFilesByTag(tag_title) {
  hideFileInfo();
  showActionStroke(`Start search by tag '${tag_title}'`);
  let files = await window.sqliteApi.findFilesByTag(tag_title);
  showFiles(files);
  showActionStroke(`Found ${files.length} results by tag '${tag_title}'`);
}
async function searchFilesByCaption(caption = '') {
  hideFileInfo();
  showTags([]);
  showActionStroke(`Start search by caption '${caption}'`);
  let files = await window.sqliteApi.queryAll(
    "SELECT * FROM files WHERE caption LIKE '%' || ? || '%' OR source_filename LIKE '%' || ? || '%'",
    [caption, caption]
  );
  showFiles(files);
  showActionStroke(`Found ${files.length} results by caption '${caption}'`);
}
async function filesClick(event) {
  let block = event.path.find((b) => b.className == 'gallery_image');
  if (block) {
    return await _clickShowFile(parseInt(block.getAttribute('data-id')));
  }
  let tagDeletion = event.path.find((b) => b.className == 'delete_file');
  if (tagDeletion) {
    _clickDeleteFileById(tagDeletion.getAttribute('data-id'));
  }
}
async function _clickShowFile(file_id) {
  let file = files.find((f) => f['id'] == file_id);
  if (!file) {
    file = await window.sqliteApi.query('SELECT * FROM files WHERE id=?', [
      file_id
    ]);
  }
  if (!file) {
    return false;
  }
  file.urls = (
    await window.sqliteApi.queryAll(
      'SELECT url FROM file_urls WHERE file_id=?',
      [file_id]
    )
  ).map((t) => t.url);
  showFileInfo(file);
  await findTagsByFile(file_id);
  return;
}
async function _clickDeleteFileById(file_id) {
  if (!window.confirm('Are you sure to delete?')) {
    return false;
  }
  let removedFile = await window.fileApi.removeFileById(file_id);
  if (removedFile) {
    showActionStroke(
      `File #${file_id} ${removedFile['full_path']} have been removed from a storage`
    );
    files = files.filter((f) => f.id != file_id && f.f2_id != file_id);
    showDupFiles(files);
    hideFileInfo();
  } else {
    showActionStroke(`Something wrong in deletion file #${file_id}`);
  }
}
async function tagsClick(event) {
  let tagSearchTag = event.path.find((a) => a.className == 'tag_search');
  if (tagSearchTag) {
    let tag_title = tagSearchTag.innerHTML.split(' / ')[0];
    setSearchString(tag_title);
    searchFilesByTag(tag_title);
    return;
  }
  let tagRemoveTag = event.path.find((a) => a.className == 'remove_tag');
  if (tagRemoveTag && currentFile && currentFile['id']) {
    _removeTag(
      currentFile['id'],
      tagRemoveTag.getAttribute('data-file-tag-id')
    );
  }
  let tagAddTag = event.path.find((a) => a.className == 'add_tag');
  if (tagAddTag) {
    _addTagToFile(event);
  }
  let tagEditTag = event.path.find((a) => a.className == 'edit_tag');
  if (tagEditTag) {
    _editTag(tagEditTag.getAttribute('data-tag-id'));
  }
}
async function _addTagToFile(event) {
  if (!currentFile && !currentFile['id']) {
    return false;
  }
  let title = document.getElementById('add_tag_title').value;
  let locale = document.getElementById('add_tag_locale').value;
  let source_type = window.constants.getSourceType('MANUAL');
  let file_id = currentFile['id'];
  await window.sqliteApi.addTag(file_id, title, locale, source_type);
  await findTagsByFile(file_id);
  showActionStroke(`Added tag '${title}'`);
}
async function _editTag(id) {
  let tag = tags.find((t) => t.id == id);
  if (!tag) {
    showActionStroke(`Cannot find tag #'${id}' in cache...`);
    return false;
  }
  let formHTML = '';
  let locales = tag['locales'];
  locales[''] = '';
  for (let key in locales) {
    formHTML +=
      `<div class='row'>` +
      `<input type='text' class='title' value='${locales[key]}' title='Remove text for removing locale' />` +
      `<input type='text' class='locale' value='${key}' placeholder='jp' maxlength='2' />` +
      `</div>`;
  }
  formHTML += `<div><button id='tag_edit_form_submit'>Update</button></div>`;
  document.getElementById('tag_edit_form_container').style.display = 'block';
  document.getElementById('tag_edit_form_container').innerHTML = formHTML;
  currentTag = tag;
}
async function _removeTag(file_id, file_tag_id) {
  await window.sqliteApi.removeTag(file_tag_id);
  showActionStroke(
    `Removed file-to-tag link #${file_tag_id} from file #${file_id}`
  );
  await findTagsByFile(file_id);
}
async function updateCaption() {
  if (!currentFile || !currentFile['id']) {
    showActionStroke('Have no current file!');
    return false;
  }
  let newCaption = document.getElementById('file_info_caption').value;
  currentFile['caption'] = newCaption;
  await window.sqliteApi.query('UPDATE files SET caption=? WHERE id=?', [
    newCaption,
    currentFile['id']
  ]);
  showActionStroke(`Caption updated for file #${currentFile['id']}`);
}
async function tagEditFormClick(event) {
  if (!event.path.find((t) => t.id == 'tag_edit_form_submit')) {
    return false;
  }
  if (!currentTag || !currentTag['id']) {
    return false;
  }
  let tagEditFormContainer = document.getElementById('tag_edit_form_container');
  let data = {};
  let locales = tagEditFormContainer.getElementsByClassName('locale');
  let titles = tagEditFormContainer.getElementsByClassName('title');
  for (let i in locales) {
    if (
      locales[i] === undefined ||
      titles[i] === undefined ||
      locales[i].value === undefined
    ) {
      continue;
    }
    await window.sqliteApi.replaceTagLocale(
      locales[i].value,
      titles[i].value,
      currentTag['id']
    );
  }

  showActionStroke(`updated tag #${currentTag['id']}`);
  tagEditFormContainer.innerHTML = '';
  tagEditFormContainer.style.block = 'none';
  currentTag = null;
}

async function openFolder(event) {
  let folder = await window.fileApi.openFolder();
  if (!(folder && folder.filePaths && folder.filePaths[0])) return false;
  let path = folder.filePaths[0];
  console.log(`Loading folder ${path}`);
  await window.fileApi.addFilesFromFolder(path);
  showActionStroke(`Folder ${path} has imported.`);
  await searchFilesByCaption();
}
async function openFile(event) {
  let file = await window.fileApi.openFile();
  if (!(file && file.filePaths && file.filePaths[0])) {
    return false;
  }
  let path = file.filePaths[0];
  console.log(`Chosen file ${path}`);
  await window.fileApi.addFile(path);
  await searchFilesByCaption();
  showActionStroke(`File ${path} has imported.`);
}
async function importFromClipboard() {
  const tmpFilePath = await window.fileApi.saveTempFileFromClipboard();
  if (!tmpFilePath) {
    showActionStroke(`Clipboard is empty.`);
    return false;
  }
  await window.fileApi.addFile(tmpFilePath);
  await window.fileApi.removeFile(tmpFilePath);
  await searchFilesByCaption();
  showActionStroke(`File has imported from a clipboard.`);
}
async function showAllTags() {
  showTags(await window.sqliteApi.getAllTags());
}
async function findTagsByFile(file_id) {
  showTags(await window.sqliteApi.findTagsByFile(file_id));
}
async function scanSelectedFiles() {
  for (let index in files) {
    let file = files[index];
    if (await window.ocrApi.fileIsNotScanned(file)) {
      try {
        console.log('Scan file: ', file);
        let recognized = await window.ocrApi.recognize(file['full_path'], [
          'eng',
          'rus',
          'jpn'
        ]); // TODO: move languages to app settings
        console.log('Recognized: ', recognized);
        let caption = recognized.data.blocks
          .filter((b) => b.text.trim() != '' && b.confidence > 70)
          .map((b) => b.text.replace(/[\n\t\r]/g, ' '))
          .join('\n');
        if (caption == '') {
          caption = CAPTION_NOT_FOUND;
        }
        console.log(`#${file['id']}: Scanned text: ${caption}`);
        await window.sqliteApi.query('UPDATE files SET caption=? WHERE id=?;', [
          caption,
          file['id']
        ]);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
async function lookUpDups(threshold = 7) {
  let dups = await window.sqliteApi.queryAll(
    'SELECT files.*, files2.id AS f2_id, files2.preview_path AS f2_preview_path, files2.width AS f2_width, files2.height AS f2_height, hamming(files.imagehash, files2.imagehash) AS distance FROM files JOIN files AS files2 ON files.id > files2.id WHERE distance < ?',
    [threshold]
  );
  showDupFiles(dups);
  showActionStroke(`${dups.length} pairs found`);
  hideFileInfo();
}

class Job {
  constructor(cooldown_low, cooldown_top) {
    this.cooldown_low = cooldown_low * 1000;
    this.cooldown_top = cooldown_top * 1000;
    this.active = false;
    this.timer = null;
    this.tasks = [];
  }
  nextCooldown() {
    return Math.floor(
      this.cooldown_low +
        Math.random() * (this.cooldown_top - this.cooldown_low)
    );
  }
  start() {
    this.active = true;
    this.runNextTask();
    this.planNextStep();
    return true;
  }
  stop() {
    this.active = false;
    clearTimeout(this.timer);
    this.timer = null;
    return true;
  }
  runNextTask() {
    let _nextTask = this.tasks.shift();
    if (typeof _nextTask === 'function') {
      _nextTask();
    } else {
      this.stop();
    }
  }
  planNextStep() {
    this.timer = setTimeout(() => {
      this.step();
    }, this.nextCooldown());
  }
  step() {
    if (!this.active) {
      return false;
    }
    this.runNextTask();
    this.planNextStep();
    return true;
  }
  addTask(task = () => {}) {
    this.tasks.push(task);
    if (!this.active) {
      this.start();
    }
    return true;
  }
}

let jobs = {
  iqdb: new Job(10, 15),
  danbooru: new Job(10, 15),
  konachan: new Job(10, 15),
  yandere: new Job(10, 15),
  gelbooru: new Job(10, 15),
  sankaku: new Job(10, 15),
  eshuushuu: new Job(10, 15),
  zerochan: new Job(10, 15),
  anime_pictures: new Job(10, 15)
};

function addJobTask(resource_name, locale, url, file) {
  jobs.danbooru.addTask(async () => {
    let tags = await window.network.extractTagsFromSource(url, resource_name);
    let source_type = await window.constants.getSourceType(
      resource_name.toUpperCase()
    );
    for (let i in tags) {
      let title = tags[i];
      console.log(`add tag ${title} to file ${file['id']}`);
      await window.sqliteApi.addTag(file['id'], title, locale, source_type);
    }
    await window.sqliteApi.addUrlToFile(url, file['id']);
    console.log(
      `Added tags to file #${file['id']} from ${resource_name}`,
      tags
    );
  });
}

async function loadTagsFromIQDB() {
  showActionStroke(`Start loading tags for ${files.length} files`);
  for (let i in files) {
    let file = files[i];
    jobs.iqdb.addTask(async () => {
      let response = await window.network.lookupIqdbFile(file['preview_path']);
      if (response.ok && response.data && response.data[1]) {
        let bestMatch = response.data[1];
        if (bestMatch.sourceUrl.match(/danbooru\.donmai\.us/)) {
          addJobTask('danbooru', 'en', bestMatch.sourceUrl, file);
        }
        if (bestMatch.sourceUrl.match(/konachan\.com/)) {
          addJobTask('konachan', 'en', bestMatch.sourceUrl, file);
        }
        if (bestMatch.sourceUrl.match(/yande\.re/)) {
          addJobTask('yandere', 'en', bestMatch.sourceUrl, file);
        }
        if (bestMatch.sourceUrl.match(/gelbooru\.com/)) {
          addJobTask('gelbooru', 'en', bestMatch.sourceUrl, file);
        }
        if (bestMatch.sourceUrl.match(/chan\.sankakucomplex\.com/)) {
          addJobTask('sankaku', 'en', bestMatch.sourceUrl, file);
        }
        if (bestMatch.sourceUrl.match(/shuushuu\.net/)) {
          addJobTask('eshuushuu', 'en', bestMatch.sourceUrl, file);
        }
        if (bestMatch.sourceUrl.match(/zerochan\.net/)) {
          addJobTask('zerochan', 'en', bestMatch.sourceUrl, file);
        }
        if (bestMatch.sourceUrl.match(/anime-pictures\.net/)) {
          addJobTask('anime_pictures', 'en', bestMatch.sourceUrl, file);
        }
      }
    });
  }
}

async function importFileFromUrl() {
  let url = await window.widget.prompt();
  if (!url) {
    showActionStroke('Form is cancelled');
    return false;
  }
  const tmpFilePath = await window.fileApi.saveTempFileFromUrl(url);
  if (!tmpFilePath) {
    showActionStroke(`Can't upload file from ${url}.`);
    return false;
  }
  let { file_id } = await window.fileApi.addFile(tmpFilePath);
  await window.fileApi.removeFile(tmpFilePath);
  if (!file_id) {
    showActionStroke(`Can't copy file from ${url}.`);
    return false;
  }
  await window.sqliteApi.addUrlToFile(url, file_id);
  showActionStroke(`File has imported from url '${url}'.`);
}
