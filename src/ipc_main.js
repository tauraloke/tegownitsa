const { ipcMain, dialog } = require("electron");
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
	return config.get("storage_dir") || path.join(__dirname, "storage");
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
	await worker.terminate(); // TODO: проверить, что сканирование нескольких файлов будет успешно.
	return result;
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
