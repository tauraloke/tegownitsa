// middle layer

const { contextBridge, ipcRenderer, clipboard } = require("electron");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const phash = require("sharp-phash");
const exifParser = require("exif-parser");
const iqdb = require("iqdb-client");

const sourceTypes = require("./source_type.json");
const tagNamespaces = require("./tag_namespaces.json");
const booruParser = require("./booru_parsers.js");

const CAPTION_YET_NOT_SCANNED = "[YET NOT SCANNED]";
const PREVIEW_PREFIX = "preview_";

window.addEventListener("DOMContentLoaded", async () => {
	// any js code here
});

function swap(hash) {
	var result = {};
	for (let key in hash) {
		result[hash[key]] = key;
	}
	return result;
}

function randomDigit() {
	return Math.floor(Math.random() * 10);
}

async function importFileToStorage(absolutePath) {
	if (!fs.statSync(absolutePath).isFile()) {
		return;
	}
	console.log("Loading file: ", absolutePath);
	const storageRootDir = await ipcRenderer.invoke("getStorageDirectoryPath");
	console.log("Storage root", storageRootDir);
	const storageDirPathForFile = path.join(
		storageRootDir,
		randomDigit().toString(),
		randomDigit().toString()
	);
	const filename =
		new Date().getTime() +
		randomDigit() +
		randomDigit() +
		path.extname(absolutePath);
	fs.mkdirSync(storageDirPathForFile, { recursive: true });
	const newFilePathInStorage = path.join(storageDirPathForFile, filename);
	const fileImage = fs.readFileSync(absolutePath);
	let imagehash = null;
	try {
		imagehash = await phash(fileImage);
	} catch (e) {
		console.log(`${absolutePath} is not image file`);
		return false;
	}
	fs.copyFile(absolutePath, newFilePathInStorage, () => {});
	const image = await sharp(fileImage);
	const metadata = await image.metadata();

	// make preview
	const newPreviewPathInStorage = path.join(
		storageDirPathForFile,
		PREVIEW_PREFIX + filename
	);
	image.resize(100).toFile(newPreviewPathInStorage);
	let fileBuffer = fs.readFileSync(absolutePath);

	// save file row to DB
	let exif = {};
	try {
		exif = exifParser.create(fileBuffer).parse(fileBuffer).tags;
	} catch (e) {}
	await ipcRenderer.invoke(
		"executeQuery",
		"INSERT INTO files (full_path, preview_path, source_filename, imagehash, width, height, caption, exif_make, exif_model, exif_latitude, exif_longitude, exif_create_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
		[
			newFilePathInStorage,
			newPreviewPathInStorage,
			path.basename(absolutePath),
			imagehash,
			metadata.width,
			metadata.height,
			CAPTION_YET_NOT_SCANNED,
			exif.Make,
			exif.Model,
			exif.GPSLatitude,
			exif.GPSLongitude,
			exif.CreateDate,
		]
	);

	// try to extract exif tags
	let file_id = (
		await ipcRenderer.invoke(
			"executeQuery",
			"SELECT MAX(id) AS file_id FROM files"
		)
	).file_id;
	if (!file_id) {
		return false;
	}

	let tags = [];
	if (exif.Artist) {
		tags.push(`creator:${exif.Artist}`);
	} else {
		if (exif.XPAuthor) {
			let author = Buffer.from(exif.XPAuthor)
				.toString("utf16le")
				.replace(/\0/, "");
			tags.push(`creator:${author}`);
		}
	}
	if (exif.XPKeywords) {
		let XPKeywords = Buffer.from(exif.XPKeywords)
			.toString("utf16le")
			.replace(/\0/, "")
			.split(";");
		tags.push(...XPKeywords);
	}
	tags = tags.filter((v, i, a) => a.indexOf(v) === i); // unique values
	let locale = "en"; // just default

	//save keywords
	let source_type = sourceTypes.EXIF;
	for (let i in tags) {
		await ipcRenderer.invoke("addTag", file_id, tags[i], locale, source_type);
	}

	return newFilePathInStorage;
}

contextBridge.exposeInMainWorld("sqliteApi", {
	query: async (query, values) => {
		try {
			return await ipcRenderer.invoke("executeQuery", query, values);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	queryAll: async (query, values) => {
		try {
			return await ipcRenderer.invoke("executeQueryAll", query, values);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	fileIsNotScanned: (file) => {
		return file["caption"] == CAPTION_YET_NOT_SCANNED;
	},
	findFilesByTag: async (title, locale = null) => {
		try {
			return await ipcRenderer.invoke("findFilesByTag", title, locale);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	findFilesByTagId: async (tag_id) => {
		try {
			return await ipcRenderer.invoke("findFilesByTagId", tag_id);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	findTagsByFile: async (file_id) => {
		try {
			return await ipcRenderer.invoke("findTagsByFile", file_id);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	getAllTags: async (event) => {
		try {
			return await ipcRenderer.invoke("getAllTags");
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	addTag: async (file_id, title, locale, source_type) => {
		try {
			return await ipcRenderer.invoke(
				"addTag",
				file_id,
				title,
				locale,
				source_type
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	removeTag: async (file_tag_id) => {
		try {
			return await ipcRenderer.invoke("removeTag", file_tag_id);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	replaceTagLocale: async (locale, title, tag_id) => {
		try {
			return await ipcRenderer.invoke(
				"replaceTagLocale",
				locale,
				title,
				tag_id
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
});

contextBridge.exposeInMainWorld("network", {
	lookUpIQDBFile: async (file_path) => {
		return await iqdb.searchPic(fs.readFileSync(file_path), { lib: "www" });
	},
	loadPage: async (url) => {
		try {
			await ipcRenderer.invoke("loadPage", url);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	extractTagsFromDanbooru: async (url) => {
		try {
			if (url.match("^//")) {
				url = `https:${url}`;
			}
			let response = null;
			try {
				// TODO: remove mockup
				response = await ipcRenderer.invoke("loadPage", url);
			} catch {
				//mockup
				response = fs.readFileSync("./mockups/danbooru.html");
			}
			return new booruParser.MoebooruParser(
				".%namespace%-tag-list li",
				"data-tag-name"
			).extractTags(response);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	extractTagsFromKonachan: async (url) => {
		try {
			if (url.match("^//")) {
				url = `https:${url}`;
			}
			let response = null;
			try {
				// TODO: remove mockup
				response = await ipcRenderer.invoke("loadPage", url);
			} catch {
				//mockup
				response = fs.readFileSync("./mockups/konachan.html");
			}
			return new booruParser.MoebooruParser(
				"li.tag-type-%namespace%",
				"data-name"
			).extractTags(response);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	extractTagsFromYandere: async (url) => {
		try {
			if (url.match("^//")) {
				url = `https:${url}`;
			}
			let response = null;
			try {
				// TODO: remove mockup
				console.log(url);
				response = await ipcRenderer.invoke("loadPage", url);
			} catch {
				//mockup
				response = fs.readFileSync("./mockups/yandere.html");
			}
			return new booruParser.YandereParser(".tag-type-%namespace%").extractTags(
				response
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	extractTagsFromGelbooru: async (url) => {
		try {
			if (url.match("^//")) {
				url = `https:${url}`;
			}
			let response = null;
			try {
				// TODO: remove mockup
				console.log(url);
				response = await ipcRenderer.invoke("loadPage", url);
			} catch {
				//mockup
				response = fs.readFileSync("./mockups/gelbooru.html");
			}
			return new booruParser.GelbooruParser(
				".tag-type-%namespace%"
			).extractTags(response);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	extractTagsFromSankaku: async (url) => {
		try {
			if (url.match("^//")) {
				url = `https:${url}`;
			}
			let response = null;
			try {
				// TODO: remove mockup
				console.log(url);
				response = await ipcRenderer.invoke("loadPage", url);
			} catch {
				//mockup
				response = fs.readFileSync("./mockups/sankaku.html");
			}
			return new booruParser.GelbooruParser(
				".tag-type-%namespace%"
			).extractTags(response);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	extractTagsFromEshuushuu: async (url) => {
		try {
			if (url.match("^//")) {
				url = `https:${url}`;
			}
			let response = null;
			try {
				// TODO: remove mockup
				console.log(url);
				response = await ipcRenderer.invoke("loadPage", url);
			} catch {
				//mockup
				response = fs.readFileSync("./mockups/eshuushuu.html");
			}
			return new booruParser.EshuushuuParser().extractTags(response);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
});

contextBridge.exposeInMainWorld("ocrApi", {
	recognize: async (imagePath, languages) => {
		try {
			return await ipcRenderer.invoke("recognize", imagePath, languages);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
});

contextBridge.exposeInMainWorld("fileApi", {
	openFolder: async (event, dirPath) => {
		try {
			return await ipcRenderer.invoke("openFolder", dirPath);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	openFile: async (event, dirPath) => {
		try {
			return await ipcRenderer.invoke("openFile", dirPath);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	addFilesFromFolder: (dirPath) => {
		fs.readdir(dirPath, async (err, files) => {
			for (let i in files) {
				let absolutePath = path.join(dirPath, files[i]);
				await importFileToStorage(absolutePath);
			}
		});
		return dirPath;
	},
	addFile: async (filePath) => {
		return await importFileToStorage(filePath);
	},
	removeFile: async (filePath) => {
		await fs.unlinkSync(filePath);
	},
	saveTempFileFromClipboard: async () => {
		let image = clipboard.readImage("clipboard");
		if (image.isEmpty()) {
			return false;
		}
		const storageRootDir = await ipcRenderer.invoke("getStorageDirectoryPath");
		const storageDirPathForFile = path.join(storageRootDir, "tmp");
		fs.mkdirSync(storageDirPathForFile, {
			recursive: true,
		});
		let tmpFilePath = path.join(storageDirPathForFile, "from_clipboard.png");
		fs.writeFileSync(tmpFilePath, image.toPNG());
		return tmpFilePath;
	},
	removeFileById: async (file_id) => {
		try {
			let file = await ipcRenderer.invoke("removeFileRow", file_id);
			if (!file) {
				return false;
			}
			fs.unlink(file["full_path"], () => {});
			fs.unlink(file["preview_path"], () => {});
			return file;
		} catch (e) {
			console.log(e);
			return false;
		}
	},
});

contextBridge.exposeInMainWorld("sourceTypes", {
	get: (name) => {
		return sourceTypes[name];
	},
});

contextBridge.exposeInMainWorld("tagNamespaces", {
	getById: (id) => {
		let hash = swap(tagNamespaces);
		return hash[id];
	},
});
