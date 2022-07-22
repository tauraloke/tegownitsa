"use strict";
const path = require("path");
const { app, BrowserWindow, Menu, ipcMain } = require("electron");
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
		? ".\\resources\\app.asar.unpacked\\libs\\sqlite\\fuzzy.dll"
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

ipcMain.handle("executeQuery", async (event, query, params) => {
	console.log("1:", await db.query("select levenshtein('101', '111')"));
	console.log("2:", await db.query("select levenshtein('111', '111')"));
	console.log("3:", await db.query("select hamming(5, 4)"));
	console.log("4:", await db.query("select hamming(4, 4)"));
	return await db.query(query, params);
});

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
