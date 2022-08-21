# Tegownitsa

GUI for a image tag manager in Linux, Windows.

## Install

- Binaries are available here: https://github.com/tauraloke/tegownitsa/releases/
- Also you can build from sources:

## Build

*Linux, and Windows 7+ are supported (64-bit only).*

**Linux**

- Clone repo

- `npm install`

- `npm run dist:l`


**Windows**

Only windows environment (due to `sharp` package).

- Clone repo

- `npm install`

- `npm run dist:w`

---

## Dev

Clone the repo. Then
```
npm install
npm start
```

## Third-party resources
- Icons: generated by [Midjourney neural network](https://www.midjourney.com/) so they published under `Creative Commons Noncommercial 4.0 Attribution International License` due to [ToS](https://midjourney.gitbook.io/docs/billing#commercial-terms).
- [IQDB](https://iqdb.org/) is independent image search engine and using to download tag data. We recommend do not commit requests by this application too often. Default timeout is 10-15 seconds now.
- Bunch of boorus. You can't download tags from a booru if this one is blocked. Default timeout is 10-15 seconds.
- [Fuzzy](https://github.com/nalgeon/sqlean/blob/main/docs/fuzzy.md) is SQLite library using for duplicate detection by a hamming distance between [perceptive hashes](https://www.phash.org/) of images. `MIT license`.
- [Electron](https://electronjs.org/) is a GUI framework for fast prototyping, `MIT license`. Current application based on [electron-boilerplate](https://github.com/sindresorhus/electron-boilerplate/), `MIT license`.
- [Sharp](https://github.com/lovell/sharp) is NodeJS module for image transformation, `Apache 2.0 license`.
- [Tesseract](https://github.com/tesseract-ocr/tesseract) OCR engine for extracting textes from images for better indexing, `Apache 2.0 license`.

## Next objectives
- Adjust HTML and styles in the application.
- Pagination.
- Add Saucenao API requests with a private token.
- Move Tesseract language list to settings.
- i18n.