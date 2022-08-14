// core calls from index.js to IPC interferency

const { app, ipcMain, dialog } = require("electron");
const { createWorker, PSM } = require("tesseract.js");
const path = require("path");

const { getDb } = require("./db.js");
const config = require("./config.js");

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
	let tag_id = null;
	let tag = await db.query(
		"SELECT tags.id from tags LEFT JOIN tag_locales WHERE tag_locales.title=? AND tag_locales.locale=?",
		[title, locale]
	);
	if (tag) {
		tag_id = tag["id"];
	} else {
		await db.run("INSERT INTO tags (id) VALUES (null)");
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

ipcMain.handle("replaceTagLocale", async (event, locale, title, tag_id) => {
	if ((title = "")) {
		await db.query("DELETE FROM tag_locales WHERE tag_id=? AND locale=?", [
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
		await db.query(
			"UPDATE tag_locales SET title = ? WHERE tag_id=? AND locale=?",
			[title, tag_id, locale]
		);
	} else {
		await db.query(
			"INSERT INTO tag_locales (tag_id, title, locale) VALUES (?, ?, ?)",
			[tag_id, title, locale]
		);
	}
});

// TODO: USE AND REMOVE
ipcMain.handle("netRequest", async (event) => {
	const { net } = require("electron");
	const request = net.request("https://github.com");
	request.on("response", (response) => {
		console.log(`STATUS: ${response.statusCode}`);
		console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
		response.on("data", (chunk) => {
			console.log(`BODY: ${chunk}`);
		});
		response.on("end", () => {
			console.log("No more data in response.");
		});
	});
	request.end();
});
