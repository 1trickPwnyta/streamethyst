const Quote = require("../../models/quote");
const log = require("../../logger");

module.exports = {
	enabled: true,
	event: ["chatbot.command.{quote}", "chatbot.command.{addquote}"],
	action: async context => {
		
		let addQuote = async text => {
			let quote = await Quote.create({
				userid: context.user["user-id"],
				username: context.user.username,
				text: text
			});
			context.chat("bot", `Quote ${quote._id} has been added.`);
			log.info(`Quote ${quote._id} was added by ${context.user.username}.`);
		};
		
		let showQuote = async quote => {
			if (quote) {
				context.chat("bot", `"${quote.text}" ${quote.createdAt}`);
			} else {
				context.chat("bot", "No quote found!");
			}
		};
		
		if (context.command == "addquote") {
			
			let text = context.message.trim();
			addQuote(text);
			
		} else if (context.command == "quote") {
			
			if (context.parameters.length > 0 && context.parameters[0].toLowerCase() == "add") {
				
				let text = context.message.substring(3).trim();
				addQuote(text);
				
			} else if (context.parameters.length == 1 && context.parameters[0].match(/^\d+$/)) {
				
				// Get quote
				let quote = await Quote.findOne({_id: context.parameters[0]});
				showQuote(quote);
				
			} else if (context.parameters.length == 0) {
				
				// Get random quote
				let count = await Quote.countDocuments();
				let random = Math.floor(Math.random() * count);
				let quote = await Quote.findOne().skip(random);
				showQuote(quote);
				
			} else {
				
				// Assume we are adding a quote
				let text = context.message.trim();
				addQuote(text);
				
			}
			
		}
		
	}
};
