module.exports = {
	enabled: false,		// **** Don't forget to enable it!!! ****
	event: "chatbot.message",
	action: context => {
		
		// YOUR CODE HERE (replace or modify below)
		
		/////////////////////////////////////
		const user = context.user;
		const message = context.message;
		const response = "Your message here!";
		/////////////////////////////////////
		
		// Chat a message as the bot as long as it isn't responding to itself (that would create an infinite loop)
		if (!user.labels.includes("bot")) context.chat("bot", response);
		
	}
};
