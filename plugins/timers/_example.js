module.exports = {
	enabled: false,		// **** Don't forget to enable it!!! ****
	event: "chatbot.connect",
	action: context => {
		
		/////////////////////////////////////
		const message = "Your message here!";
		const minutes = 60;
		/////////////////////////////////////
		
		setInterval(() => {
			context.chat("bot", message);
		}, 1000 * 60 * minutes);
		
	}
};
