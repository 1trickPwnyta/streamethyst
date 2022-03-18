module.exports = {
	enabled: false,		// **** Don't forget to enable it!!! ****
	event: "chatbot.streamstart", 
	action: context => {
		
		// YOUR CODE HERE (replace or modify below)
		
		/////////////////////////////////////
		const message = "The stream has started!";
		/////////////////////////////////////
		
		// Chat a message
		context.chat("bot", message);
		
	}
};
