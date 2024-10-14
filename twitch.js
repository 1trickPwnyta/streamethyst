const { ApiClient } = require("twitch");
const { RefreshableAuthProvider, StaticAuthProvider } = require("twitch-auth");
const { promises } = require("fs");
const log = require("./logger");

module.exports = async() => {
	let settings = await require("./settings")();
	let credentials = settings.api.credentials;
	return new ApiClient({
		authProvider: new RefreshableAuthProvider(
			new StaticAuthProvider (
				credentials.clientid,
				credentials.token.accessToken
			),
			{
				clientSecret: credentials.clientSecret,
				refreshToken: credentials.token.refreshToken,
				expiry: credentials.token.expiryTimestamp === null ? null : new Date(credentials.token.expiryTimestamp), 
				onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
					log.debug("Refreshing Twitch access token.");
					settings.api.credentials.token = {
						accessToken: accessToken, 
						refreshToken: refreshToken, 
						expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
					};
					await promises.writeFile("./settings.json", JSON.stringify(settings, null, 4), "UTF-8");
					log.debug("New Twitch access token written to settings.json.");
				}
			}
		)
	}).helix;
};
