const { ApiClient } = require("twitch");
const { ClientCredentialsAuthProvider } = require("twitch-auth");
const settings = require("./settings").api;

module.exports = new ApiClient({
	authProvider: new ClientCredentialsAuthProvider(
		settings.credentials.clientid,
		settings.credentials.secret
	)
}).helix;