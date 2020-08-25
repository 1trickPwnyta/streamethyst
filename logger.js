const colors = require("colors");

function log(level, message) {
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
}

module.exports = {
	error: message => log("error", message),
	warning: message => log("warning", message),
	info: message => log("info", message),
	debug: message => log("debug", message),
	custom: log
};
