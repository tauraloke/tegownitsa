"use strict";
const path = require("path");
const { app, Menu, shell } = require("electron");
const {
	is,
	appMenu,
	aboutMenuItem,
	openUrlMenuItem,
	openNewGitHubIssue,
	debugInfo,
} = require("electron-util");
const config = require("./config.js");

const showPreferences = () => {
	// Show the app's preferences here
	console.log("test");
};

const helpSubmenu = [
	openUrlMenuItem({
		label: "Website",
		url: "https://github.com/tauraloke/tegownitsa",
	}),
	openUrlMenuItem({
		label: "Source Code",
		url: "https://github.com/tauraloke/tegownitsa",
	}),
	{
		label: "Report an Issue…",
		click() {
			const body = `
<!-- Please succinctly describe your issue and steps to reproduce it. -->


---

${debugInfo()}`;

			openNewGitHubIssue({
				user: "tauraloke",
				repo: "tegownitsa",
				body,
			});
		},
	},
];

if (!is.macos) {
	helpSubmenu.push(
		{
			type: "separator",
		},
		aboutMenuItem({
			icon: path.join(__dirname, "../static", 'menu', "url.png"),
			copyright: "Created by Tauraloke Esteru and Github contributors",
			text: "Yet another image tag manager",
			website: "https://github.com/tauraloke/tegownitsa",
		})
	);
}

const debugSubmenu = [
	{
		label: "Show Settings",
		click() {
			config.openInEditor();
		},
	},
	{
		label: "Show App Data",
		click() {
			shell.openItem(app.getPath("userData"));
		},
	},
	{
		type: "separator",
	},
	{
		label: "Delete Settings",
		click() {
			config.clear();
			app.relaunch();
			app.quit();
		},
	},
	{
		label: "Delete App Data",
		click() {
			shell.moveItemToTrash(app.getPath("userData"));
			app.relaunch();
			app.quit();
		},
	},
];

const macosTemplate = [
	appMenu([
		{
			label: "Preferences…",
			accelerator: "Command+,",
			click() {
				showPreferences();
			},
		},
	]),
	{
		role: "fileMenu",
		submenu: [
			{
				label: "Custom",
			},
			{
				type: "separator",
			},
			{
				role: "close",
			},
		],
	},
	{
		role: "editMenu",
	},
	{
		role: "viewMenu",
	},
	{
		role: "windowMenu",
	},
	{
		role: "help",
		submenu: helpSubmenu,
	},
];

// Linux and Windows
const otherTemplate = [
	{
		role: "fileMenu",
		submenu: [
			{
				label: "Import image from file",
				icon: path.join(__dirname, "../static", "menu", "file.png"),
				click(_menuItem, browserWindow, _event) {
					browserWindow.webContents.executeJavaScript(`openFile()`);
				},
			},
			{
				label: "Import images from folder",
				icon: path.join(__dirname, "../static", "menu", "folder.png"),
				click(_menuItem, browserWindow, _event) {
					browserWindow.webContents.executeJavaScript(`openFolder()`);
				},
			},
			{
				label: "Import image from direct URL",
				icon: path.join(__dirname, "../static", "menu", "url.png"),
				click(_menuItem, browserWindow, _event) {
					browserWindow.webContents.executeJavaScript(`importFileFromUrl()`);
				},
			},
			{
				icon: path.join(__dirname, "../static", "menu", "clipboard.png"),
				label: "Import image from clipboard",
				click(_menuItem, browserWindow, _event) {
					browserWindow.webContents.executeJavaScript(`importFileFromUrl()`);
				},
			},
			{
				type: "separator",
			},
			{
				role: "quit",
				icon: path.join(__dirname, "../static", "menu", "exit.png"),
			},
		],
	},
	{
		role: "editMenu",
		submenu: [
			{
				label: "Settings",
				icon: path.join(__dirname, "../static", "menu", "settings.png"),
				accelerator: "Control+,",
				click() {
					showPreferences();
				},
			},
			{
				type: "separator",
			},
			{
				label: "Scan text on current files",
				icon: path.join(__dirname, "../static", "menu", "scan.png"),
				click(_menuItem, browserWindow, _event) {
					browserWindow.webContents.executeJavaScript(`scanSelectedFiles()`);
				},
			},
			{
				label: "Find duplicates",
				icon: path.join(__dirname, "../static", "menu", "dups.png"),
				click(_menuItem, browserWindow, _event) {
					browserWindow.webContents.executeJavaScript(`lookUpDups()`);
				},
			},
			{
				label: "Load tags from IQDB for current files",
				icon: path.join(__dirname, "../static", "menu", "iqdb.png"),
				click(_menuItem, browserWindow, _event) {
					browserWindow.webContents.executeJavaScript(`loadTagsFromIQDB()`);
				},
			},
		],
	},
	{
		role: "viewMenu",
	},
	{
		role: "help",
		submenu: helpSubmenu,
	},
];

const template = is.macos ? macosTemplate : otherTemplate;

if (is.development) {
	template.push({
		label: "Debug",
		submenu: debugSubmenu,
	});
}

module.exports = Menu.buildFromTemplate(template);
