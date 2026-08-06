const { promises } = require("fs");
const log = require("./logger");

module.exports = async() => {
	try {
		return JSON.parse(await promises.readFile("./settings.json"));
	} catch (e) {
		log.error("Error while parsing settings file: " + e);
	}
};
