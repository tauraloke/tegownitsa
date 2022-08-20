// core calls from index.js to IPC interferency

const { app, ipcMain, dialog } = require("electron");
const { createWorker, PSM } = require("tesseract.js");
const path = require("path");
const fetch = require("node-fetch");
const prompt = require("electron-prompt");

const { getDb } = require("./db.js");
const config = require("./config.js");
const tagNamespaces = require("./tag_namespaces.json");

let db = null;
(async () => {
	db = await getDb({ dbPath: config.get("sql_filename_path") });
})();

ipcMain.handle("executeQuery", async (event, query, values) => {
	return await db.query(query, values);
});

ipcMain.handle("executeQueryAll", async (event, query, values) => {
	return await db.queryAll(query, values);
});

ipcMain.handle("openFolder", async (event, path) => {
	return await dialog.showOpenDialog({
		properties: ["openDirectory"],
	});
});

ipcMain.handle("openFile", async (event, path) => {
	return await dialog.showOpenDialog({
		properties: ["openFile"],
	});
});

ipcMain.handle("getStorageDirectoryPath", async () => {
	let currentDirPath = path.join(
		require("path").dirname(app.getPath("exe")),
		"storage"
	);
	return config.get("storage_dir") || currentDirPath;
});

ipcMain.handle("recognize", async (event, imagePath, languages = []) => {
	console.log("Scan file ", imagePath);
	const worker = createWorker();
	await worker.load();
	await worker.loadLanguage(languages.join("+"));
	await worker.initialize(languages.join("+"));
	await worker.setParameters({
		tessedit_pageseg_mode: PSM.AUTO,
	});
	const result = await worker.recognize(imagePath);
	await worker.terminate();
	return result;
});

ipcMain.handle("findFilesByTag", async (event, title, locale = null) => {
	if (locale) {
		return await db.queryAll(
			"SELECT files.* FROM files LEFT JOIN file_tags ON file_tags.file_id = files.id LEFT JOIN tag_locales ON tag_locales.tag_id = file_tags.tag_id WHERE tag_locales.title = ? AND tag_locales.locale = ?",
			[title, locale]
		);
	} else {
		return await db.queryAll(
			"SELECT files.* FROM files LEFT JOIN file_tags ON file_tags.file_id = files.id LEFT JOIN tag_locales ON tag_locales.tag_id = file_tags.tag_id WHERE tag_locales.title = ?",
			[title]
		);
	}
});

ipcMain.handle("findFilesByTagId", async (event, tag_id) => {
	return await db.queryAll(
		"SELECT files.* FROM files LEFT JOIN file_tags ON file_tags.file_id = files.id WHERE file_tags.tag_id = ?",
		[tag_id]
	);
});

async function getTagList(query, params = []) {
	let response = await db.queryAll(query, params);
	let tags = {};
	response.forEach((row) => {
		tags[row["tag_id"]] ||= { id: row["tag_id"], locales: {} };
		tags[row["tag_id"]]["locales"][row["locale"]] = row["title"];
		tags[row["tag_id"]]["source_type"] ||= row["source_type"];
		tags[row["tag_id"]]["file_tag_id"] ||= row["file_tag_id"];
		tags[row["tag_id"]]["file_count"] ||= row["file_count"];
		tags[row["tag_id"]]["namespace_id"] ||= row["namespace_id"];
	});
	return Object.values(tags);
}

ipcMain.handle("findTagsByFile", async (event, file_id) => {
	return await getTagList(
		"SELECT tags.*, tag_locales.*, file_tags.id AS file_tag_id, file_tags.source_type AS source_type FROM tag_locales LEFT JOIN tags ON tags.id=tag_locales.tag_id LEFT JOIN file_tags ON tags.id=file_tags.tag_id WHERE file_id=?;",
		[file_id]
	);
});

ipcMain.handle("getAllTags", async (event) => {
	return await getTagList(
		"SELECT tags.*, tag_locales.* FROM tag_locales LEFT JOIN tags ON tags.id=tag_locales.tag_id;"
	);
});

ipcMain.handle("addTag", async (event, file_id, title, locale, source_type) => {
	title = title.trim();
	let tag_id = null;
	let namespaces = Object.keys(tagNamespaces).map((t) => t.toLowerCase());
	let namespace = "general"; // default
	for (let i in namespaces) {
		namespace = namespaces[i];
		let match = title.match(`^${namespace}:(.*)`);
		if (match) {
			title = match[1];
			break;
		}
	}
	let namespace_id = tagNamespaces[namespace.toUpperCase()] ?? 0;
	let tag = await db.query(
		"SELECT tags.id from tags LEFT JOIN tag_locales WHERE tag_locales.title=? AND tag_locales.locale=? AND tags.namespace_id=?",
		[title, locale, namespace_id]
	);
	if (tag) {
		tag_id = tag["id"];
	} else {
		await db.run("INSERT INTO tags (id, namespace_id) VALUES (null, ?)", [
			namespace_id,
		]);
		tag_id = (await db.query("SELECT last_insert_rowid() AS tag_id")).tag_id;
		await db.query(
			"INSERT INTO tag_locales (tag_id, title, locale) VALUES (?, ?, ?)",
			[tag_id, title, locale]
		);
	}
	let checkDup = await db.query(
		"SELECT * FROM file_tags WHERE file_id=? AND tag_id=? AND source_type=?",
		[file_id, tag_id, source_type]
	);
	if (checkDup) {
		return false;
	}
	await db.query(
		"INSERT INTO file_tags (file_id, tag_id, source_type) VALUES (?, ?, ?)",
		[file_id, tag_id, source_type]
	);
	await db.query("UPDATE tags SET file_count = file_count + 1 WHERE id = ?", [
		tag_id,
	]);
});

ipcMain.handle("removeTag", async (event, file_tag_id) => {
	let tag = await db.query(
		"SELECT * from tags LEFT JOIN file_tags ON file_tags.tag_id=tags.id WHERE file_tags.id=?",
		[file_tag_id]
	);
	if (!tag) {
		return false;
	}
	await db.run("UPDATE tags SET file_count = file_count - 1 WHERE id = ?", [
		tag["tag_id"],
	]);
	await db.run("DELETE FROM file_tags WHERE id = ?", [file_tag_id]);
	return true;
});

ipcMain.handle("removeFileRow", async (event, file_id) => {
	if (!file_id) {
		return false;
	}
	let file = await db.query("SELECT * FROM files WHERE id=?", [file_id]);
	if (!file) {
		return false;
	}
	await db.run("DELETE FROM files WHERE id=?", [file_id]);
	await db.run("DELETE FROM file_tags WHERE file_id=?", [file_id]);
	return file;
});

ipcMain.handle("replaceTagLocale", async (event, locale, title, tag_id) => {
	if (!locale) {
		return false;
	}
	if (title == "") {
		await db.run("DELETE FROM tag_locales WHERE tag_id=? AND locale=?", [
			tag_id,
			locale,
		]);
		return false;
	}
	let checkLocale = await db.query(
		"SELECT id FROM tag_locales WHERE tag_id=? AND locale=?",
		[tag_id, locale]
	);
	if (checkLocale) {
		await db.run(
			"UPDATE tag_locales SET title = ? WHERE tag_id=? AND locale=?",
			[title, tag_id, locale]
		);
	} else {
		await db.run(
			"INSERT INTO tag_locales (tag_id, title, locale) VALUES (?, ?, ?)",
			[tag_id, title, locale]
		);
	}
});

ipcMain.handle("loadPage", async (event, url) => {
	return await (await fetch(url)).text();
});

ipcMain.handle("loadBuffer", async (event, url) => {
	return await (await fetch(url)).buffer();
});

ipcMain.handle("addUrlToFile", async (event, url, file_id) => {
	let file = await db.query("SELECT * FROM files WHERE id=?", [file_id]);
	if (!file) {
		return false;
	}
	let dupCheck = await db.query(
		"SELECT id FROM file_urls WHERE file_id=? AND url=?",
		[file_id, url]
	);
	if (dupCheck) {
		return false;
	}
	await db.run("INSERT INTO file_urls (file_id, url) VALUES (?, ?)", [
		file_id,
		url,
	]);
	return true;
});

ipcMain.handle("prompt", async (event, options) => {
	return await prompt(options);
});
