"use strict";
const path = require("path");
const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
/// const {autoUpdater} = require('electron-updater');
const { is } = require("electron-util");
const unhandled = require("electron-unhandled");
const debug = require("electron-debug");
const contextMenu = require("electron-context-menu");
const config = require("./config.js");
const menu = require("./menu.js");

unhandled();
debug();
contextMenu();

// Note: Must match `build.appId` in package.json
app.setAppUserModelId("com.electron.Tegownitsa");

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		show: false,
		width: 600,
		height: 400,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
	});

	win.on("ready-to-show", () => {
		win.show();
	});

	win.on("closed", () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = undefined;
	});

	await win.loadFile(path.join(__dirname, "index.html"));

	return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on("second-instance", () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

app.on("window-all-closed", () => {
	if (!is.macos) {
		app.quit();
	}
});

app.on("activate", async () => {
	if (!mainWindow) {
		mainWindow = await createMainWindow();
	}
});

(async () => {
	await app.whenReady();
	Menu.setApplicationMenu(menu);
	initDatabase();
	mainWindow = await createMainWindow();

	const favoriteAnimal = config.get("favoriteAnimal");
	mainWindow.webContents.executeJavaScript(
		`document.querySelector('header p').textContent = 'Your favorite animal is ${favoriteAnimal}'`
	);
})();

const sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database("db.sqlite3");
console.log("Loading sqlite fuzzy extension...");
db.loadExtension(
	process.platform == "win32"
		? app.isPackaged
			? ".\\resources\\app.asar.unpacked\\libs\\sqlite\\fuzzy.dll"
			: ".\\libs\\sqlite\\fuzzy.dll"
		: "./libs/sqlite/fuzzy"
);

db.query = function (query, params) {
	return new Promise(function (resolve, reject) {
		db.get(query, params, function (err, row) {
			if (err) reject("Read error: " + err.message);
			else {
				resolve(row);
			}
		});
	});
};

async function initDatabase() {
	// make tables if not exists...
	await db.run(
		"CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, fullpath TEXT, source_filename TEXT, width INTEGER, height INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at INTEGER, imagehash INTEGER)"
	);
}

ipcMain.handle("executeQuery", async (event, query, values) => {
	return await db.query(query, values);
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

// SAMPLES TODO: USE AND REMOVE
ipcMain.handle("netRequest", async (event) => {
	// TODO: USE AND REMOVE
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

const Tesseract = require('tesseract.js');

Tesseract.recognize(
  'https://tesseract.projectnaptha.com/img/eng_bw.png',
  'eng',
  { logger: m => console.log(m) }
).then(({ data: { text } }) => {
  console.log(text);
})

/* TODO: USE AND REMOVE
const fs = require("fs");
//const Promise = require("bluebird");
const phash = require("sharp-phash");
const assert = require("assert");
const dist = require("sharp-phash/distance");
const img1 = fs.readFileSync("./Lenna.png");
const img2 = fs.readFileSync("./Lenna.jpg");
const img3 = fs.readFileSync("./Lenna-sepia.jpg");
const img4 = fs.readFileSync("./Lenna-not.png");
Promise.all([phash(img1), phash(img2), phash(img3), phash(img4)]).then(
	([hash1, hash2, hash3, hash4]) => {
		// hash returned is 64 characters length string with 0 and 1 only
		console.log("dist 1 2", dist(hash1, hash2));
		console.log("dist 2 3", dist(hash2, hash3));
		console.log("dist 3 1", dist(hash3, hash1));
		console.log("dist 1 4", dist(hash1, hash4));
		console.log("dist 2 4", dist(hash2, hash4));
		console.log("dist 3 4", dist(hash3, hash4));
	}
);
*/

/*console.log("1:", await db.query("select levenshtein('101', '111')")); TODO: USE AND REMOVE
	console.log("2:", await db.query("select levenshtein('111', '111')"));
	console.log("3:", await db.query("select hamming(5, 4)"));
	console.log("4:", await db.query("select hamming(4, 4)"));*/
