const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");
const phash = require("sharp-phash");

function randomDigit() {
	return Math.floor(Math.random() * 10);
}

const storageDir = path.join(__dirname, "storage");

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
	addFilesFromFolder: (dirPath) => {
		fs.readdir(dirPath, (err, files) => {
			files.forEach((filePath) => {
				let absolutePath = path.join(dirPath, filePath);
				if (!fs.statSync(absolutePath).isFile()) {
					return;
				}
				console.log(absolutePath);
				storageDirPathForFile = path.join(
					storageDir,
					randomDigit().toString(),
					randomDigit().toString()
				);
				fs.mkdir(storageDirPathForFile, { recursive: true }, (err) => {
					if (err) throw err;
					let newFilePathInStorage = path.join(
						storageDirPathForFile,
						new Date().getTime() +
							randomDigit() +
							randomDigit() +
							path.extname(filePath)
					);
					const fileImage = fs.readFileSync(absolutePath);
					phash(fileImage)
						.then((imagehash) => {
							fs.copyFile(absolutePath, newFilePathInStorage, () => {});
							console.log([newFilePathInStorage, filePath, imagehash]);
							ipcRenderer.invoke(
								"executeQuery",
								"INSERT INTO files (fullpath, source_filename, imagehash) VALUES (?, ?, ?)",
								[newFilePathInStorage, filePath, parseInt(imagehash, 2)]
							);
						})
						.catch((err) => console.log(err));
				});
			});
		});
		console.log("fdrgghfgfb", dirPath);
		return dirPath;
	},
});
