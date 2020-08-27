const cooldown = require("./features/cooldown");

module.exports = cooldown({
	globalCooldownSeconds: 5,
	userCooldownSeconds: 60
}, {
	enabled: false,		// **** Don't forget to enable it!!! ****
	event: "chatbot.command.{example}",		// Replace example with your command
	action: context => {
		
		// YOUR CODE HERE
		
	}
};
