# Tegownitsa ![main workflow](https://github.com/tauraloke/tegownitsa/actions/workflows/main.yml/badge.svg?branch=main&event=push)

GUI for a image tag manager in Linux, Windows.

Now you can put your image collection in order... Or not.

# How to use

- Import images via actions in the menu `File`.
- Find and remove low-dimensional duplicates.
- Scan images and find them by a recognized text if you remember it.
- Lurk tags, mark tags by your own hands or choose smooth tips of a neural net.
- Find images by tag net. You can use pseudonamespaces like `in_url:...` (find images with linked urls), `in_title:...` (find images with titles of linked urls), `in_filename:...` (find by original filename), `in_reco:...` (find by recognized text), `fresh:15` (find images created latest 15 minutes), `limit:100` (get  a limited image set), `limit:no` (get images without a limit).
- Find remote sources of an image by this application.
- You can edit tags after a right click.
- Export images by a right click on an image and copying to a clipboard.
- Great! Now you have remembered the image you want... Perhaps.

---

## Requirements

### Comfortable

- 1.4+ Gb free disc space (SSD)
- 16 Gb RAM
- i7

### Minimal

Unknown.

## Install

- Binaries are available here: https://github.com/tauraloke/tegownitsa/releases/
- Also you can clone the project and build from sources:

## Build

_Linux, and Windows 7+ are supported (64-bit only)._

**Linux**

- Clone repo

- `npm install`

- `npm run dist`


**Windows**

Only windows environment (due to `sharp` package).

- Clone repo

- `npm install`

- `npm run dist`

---

## Release

- Update a version and create a new tag by `npm run release`.

- Build linux and windows dists (see above).

- Upload *.Appimage, latest-linux.yml; *.exe, latest.yml, *.exe.blockmap to Github by the uploader "[creating new release](https://github.com/tauraloke/tegownitsa/releases/new)".

New version will be downloaded silently after a next launch of the app and applied after window' exit.


---

## Dev

Clone the repo. Then

```
npm install
npm start
```

**WSL useful trick**: run a linux desktop application via `WSL2` + `VcXsrv`.

---

## Third-party resources

- Interface
  - Icons are generated by
  [Midjourney neural network](https://www.midjourney.com/) so these ones are
  published under
  `Creative Commons Noncommercial 4.0 Attribution International License` due to
  [ToS](https://midjourney.gitbook.io/docs/billing#commercial-terms).
  - [Electron](https://electronjs.org/) is a GUI framework for fast prototyping,
  `MIT license`. Current application based on
  [electron-boilerplate](https://github.com/sindresorhus/electron-boilerplate/),
  `MIT license`.
  - [VueJS](https://vuejs.org/) is a frontend framework. `MIT license`.
  - [Vuetify](https://vuetifyjs.com/) is an UI framefork for Vue applications. `MIT license`.
  - [Vue18n](https://kazupon.github.io/vue-i18n/) for localizations. `MIT license`.

- API
  - [IQDB](https://iqdb.org/) is independent image search engine and using to
  download tag data. We recommend do not commit requests by this application too
  often. Default timeout range in application is 30-60 seconds now.
  - Bunch of boorus. You can't download tags from a booru if this one is blocked.
  Default timeout range is 30-60 seconds.
  - [Fuzzy](https://github.com/nalgeon/sqlean/blob/main/docs/fuzzy.md) is SQLite
  library using for duplicate detection by a hamming distance between
  [perceptive hashes](https://www.phash.org/) of images. `MIT license`.
  - [Sharp](https://github.com/lovell/sharp) is NodeJS module for image
  transformation, `Apache 2.0 license`.
  - [Tesseract](https://github.com/tesseract-ocr/tesseract) OCR engine for
  extracting textes from images for better indexing, `Apache 2.0 license`.
  - [TensorflowJS](https://www.tensorflow.org/js/) is a ML library adapted for JavaScript, `Apache-2.0 license`.
  - [Autotagger](https://github.com/danbooru/autotagger) is a project to predict tags on anime images. You can see [online demo](https://autotagger.donmai.us/). `MIT license`.


## How you can help

- This bundle is very large. There is a big potential to compress package by cutting unusable libraries. BTW experiements with Webpack and Tesseract, Sharp, TensorflowJS are unseccuessful yet.
- Suggest a translation to other languages. You can find localization files in the folder `<root>/src/locales/`.

## Next goals

- [x] Adjust HTML and styles in the application.
- [x] Move Tesseract language list to settings.
- [x] i18n.
- [x] Make job interface for scanning and tag search.
- [x] Add Saucenao API requests with a private token.
- [x] Optimize tag extraction by replacing scraping HTML to JSON API if possible.
- [x] Try to add tag prediction like [Autotagger](https://github.com/danbooru/autotagger).
- [x] Refine search interface for tags and other texts of images.
- [x] Mark requested tag sources of a file as visited to prevent double requesting.
- [x] Add tag extraction when a file imported by URL.
- [ ] Add an architecture of plugins for Tesseract and Autotagging options. Current bundle is really too big.

