"use strict";
const Store = require("electron-store");

module.exports = new Store({
	defaults: {
		sql_filename_path: "db.sqlite3",
	},
});
