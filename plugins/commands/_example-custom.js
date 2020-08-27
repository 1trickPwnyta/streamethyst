module.exports = {
	enabled: false,		// **** Don't forget to enable it!!! ****
	event: "chatbot.command.{example}",		// Replace example with your command
	action: context => {
		
		// YOUR CODE HERE (replace or modify below)
		
		/////////////////////////////////////
		const message = "Your message here!";
		const sound = "name-of-sound-file-in-static/audio/.mp3"
		/////////////////////////////////////
		
		// Chat a message
		context.chat("bot", message);
		
		// Play a sound
		context.io.playSound(sound);
		
	}
};
