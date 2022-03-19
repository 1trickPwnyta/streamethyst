const { ApiClient } = require("twitch");
const { StaticAuthProvider  } = require("twitch-auth");
const settings = require("./settings").api;

module.exports = new ApiClient({
	authProvider: new StaticAuthProvider (
		settings.credentials.clientid,
		settings.credentials.token
	)
}).helix;