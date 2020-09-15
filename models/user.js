const restful = require("node-restful");
const mongoose = restful.mongoose;
const mcu = require("mongoose-createdat-updatedat");

let schema = new mongoose.Schema({
	userid: String,
	username: String
});
schema.plugin(mcu);

module.exports = restful.model("User", schema);
