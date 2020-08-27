module.exports = {
	enabled: false,		// **** Don't forget to enable it!!! ****
	event: "chatbot.command.{example}",		// Replace example with your command
	action: context => {
		
		/////////////////////////////////////
		const message = "Your message here!";
		/////////////////////////////////////
		
		context.chat("bot", message);
		
	}
};
