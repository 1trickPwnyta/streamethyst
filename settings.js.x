module.exports = {
	serverPort: 9095,
	
	chatbot: {
		// Obtain passwords using https://twitchapps.com/tmi/ NOT YOUR TWITCH PASSWORD
		credentials: {
			"streamer": {
				username: "yourTwitchUsername",
				password: "oauth:..."
			},
			"bot": {
				username: "botTwitchUsername",
				password: "oauth:..."
			}
		},
		channel: "yourTwitchUsername",
		commandPrefix: "!"
	},
	
	api: {
		credentials: {
			clientid: "yourTwitchApplicationClientId",
			secret: "yourTwitchApplicationClientSecret"
		}
	}, 
	
	overlay: {
		width: 1920,
		height: 1080
	}
	
};
