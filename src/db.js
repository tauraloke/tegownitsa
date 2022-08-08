const sqlite3 = require("sqlite3").verbose();
const { app } = require("electron");

let dbc = null;

function loadSqliteExtension(dbConnection, name) {
	dbConnection.loadExtension(
		process.platform == "win32"
			? app.isPackaged
				? `.\\resources\\app.asar.unpacked\\libs\\sqlite\\${name}.dll`
				: `.\\libs\\sqlite\\${name}.dll`
			: `./libs/sqlite/${name}`
	);

	return dbConnection;
}

function _queryAll(query, params) {
	return new Promise(function (resolve, reject) {
		dbConnection.all(query, params, function (err, row) {
			if (err) reject("Read error: " + err.message);
			else {
				resolve(row);
			}
		});
	});
}

function _query(query, params) {
	return new Promise(function (resolve, reject) {
		dbConnection.get(query, params, function (err, row) {
			if (err) reject("Read error: " + err.message);
			else {
				resolve(row);
			}
		});
	});
}

async function initDatabase({ dbPath }) {
	console.log("Loading sqlite fuzzy extension...");
	dbConnection = new sqlite3.Database(dbPath);

	// load fuzzy search extension
	dbConnection = loadSqliteExtension(dbConnection, "fuzzy");

	dbConnection.queryAll = _queryAll;
	dbConnection.query = _query;

	// make tables if not exists...
	await dbConnection.run(
		"CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, fullpath TEXT, source_filename TEXT, width INTEGER, height INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at INTEGER, imagehash INTEGER, caption TEXT)"
	);

	console.log("Done.");
	return dbConnection;
}

module.exports = {
	getDb: async ({ dbPath }) => {
		return dbc || (await initDatabase({ dbPath: dbPath }));
	},
};
