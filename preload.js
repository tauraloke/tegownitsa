const { contextBridge, ipcRenderer } = require("electron");

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
	query: async (query, fetch, value) => {
		try {
			return await ipcRenderer.invoke("executeQuery", query, fetch, value);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	ajax: async (query, fetch, value) => {
		try {
			return await ipcRenderer.invoke("netRequest");
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
});
