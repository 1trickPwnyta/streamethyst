const restful = require("node-restful");
const mongoose = restful.mongoose;
const mcu = require("mongoose-createdat-updatedat");
const mai = require("mongoose-auto-increment");

let schema = new mongoose.Schema({
	userid: String,
	username: String,
	text: String
});
schema.plugin(mcu);
schema.plugin(mai.plugin, "Quote");

module.exports = restful.model("Quote", schema);
