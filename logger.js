const fs = require("fs");
const promises = fs.promises;
const colors = require("colors");

async function log(level, message) {
	switch (level.toLowerCase()) {
		case "error":
			console.error(message.red);
			break;
		case "warning":
			console.log(message.yellow);
			break;
		case "info":
			console.log(message);
			break;
		case "debug":
			console.log(message.green);
			break;
		default:
			console.log(`${level}: ${message}`);
			break;
	}
	let settings = await require("./settings")();
	if (fs.existsSync(settings.logFile)) {
		let stats = await promises.stat(settings.logFile);
		if (stats.size > 1024 * 1024 * 100) {	// 100 MB
			await promises.rename(settings.logFile, settings.logFile.concat(".", Math.floor(new Date().getTime() / 1000)));
		}
	}
	let delimiter = " | ";
	await promises.appendFile(settings.logFile, (new Date()).toISOString().concat(delimiter, level.toUpperCase(), delimiter, message, "\r\n"));
}

module.exports = {
	error: async message => await log("error", message),
	warning: async message => await log("warning", message),
	info: async message => await log("info", message),
	debug: async message => await log("debug", message),
	custom: log
};
