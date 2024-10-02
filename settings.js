const { promises } = require("fs");

module.exports = async() => JSON.parse(await promises.readFile("./settings.json"));
