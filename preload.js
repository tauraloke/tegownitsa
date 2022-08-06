const { contextBridge, ipcRenderer, clipboard } = require("electron");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const phash = require("sharp-phash");

const storageDir = path.join(__dirname, "storage");

function randomDigit() {
	return Math.floor(Math.random() * 10);
}

async function importFileToStorage(absolutePath) {
	if (!fs.statSync(absolutePath).isFile()) {
		return;
	}
	console.log("Loading file: ", absolutePath);
	const storageDirPathForFile = path.join(
		storageDir,
		randomDigit().toString(),
		randomDigit().toString()
	);
	fs.mkdirSync(storageDirPathForFile, { recursive: true });
	const newFilePathInStorage = path.join(
		storageDirPathForFile,
		new Date().getTime() +
			randomDigit() +
			randomDigit() +
			path.extname(absolutePath)
	);
	const fileImage = fs.readFileSync(absolutePath);
	const imagehash = await phash(fileImage);
	fs.copyFile(absolutePath, newFilePathInStorage, () => {});
	const image = await sharp(fileImage);
	const metadata = await image.metadata();
	ipcRenderer.invoke(
		"executeQuery",
		"INSERT INTO files (fullpath, source_filename, imagehash, width, height) VALUES (?, ?, ?, ? , ?)",
		[
			newFilePathInStorage,
			path.basename(absolutePath),
			parseInt(imagehash, 2),
			metadata.width,
			metadata.height,
		]
	);
	return newFilePathInStorage;
}

window.addEventListener("DOMContentLoaded", async () => {
	const replaceText = (selector, text) => {
		const element = document.getElementById(selector);
		if (element) element.innerText = text;
	};

	for (const type of ["chrome", "node", "electron"]) {
		replaceText(`${type}-version`, process.versions[type]);
	}
});

contextBridge.exposeInMainWorld("sqliteApi", {
	query: async (query, fetch, values) => {
		try {
			return await ipcRenderer.invoke("executeQuery", query, values);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	ajax: async () => {
		try {
			return await ipcRenderer.invoke("netRequest");
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
		fs.readdir(dirPath, (err, files) => {
			files.forEach((filePath) => {
				let absolutePath = path.join(dirPath, filePath);
				importFileToStorage(absolutePath);
			});
		});
		return dirPath;
	},
	addFile: async (filePath) => {
		return await importFileToStorage(filePath);
	},
	removeFile: async (filePath) => {
		await fs.unlinkSync(filePath);
	},
	saveTempFileFromClipboard: () => {
		let image = clipboard.readImage("clipboard");
		if (image.isEmpty()) {
			return false;
		}
		const storageDirPathForFile = path.join(storageDir, "tmp");
		fs.mkdirSync(storageDirPathForFile, {
			recursive: true,
		});
		let tmpFilePath = path.join(storageDirPathForFile, "from_clipboard.png");
		fs.writeFileSync(tmpFilePath, image.toPNG());
		return tmpFilePath;
	},
});
