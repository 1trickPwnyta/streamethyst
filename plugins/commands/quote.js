const Quote = require("../../models/quote");
const log = require("../../logger");

module.exports = {
	enabled: true,
	event: [
		"chatbot.command.{quote}", 
		"chatbot.command.{addquote}", 
		"chatbot.command.{deletequote}",
		"chatbot.command.{searchquote}"
	],
	action: async context => {
		
		let addQuote = async text => {
			if (text) {
				let quote = await Quote.create({
					userid: context.user["user-id"],
					username: context.user.username,
					text: text
				});
				context.chat("bot", `Quote ${quote._id} has been added.`);
				log.info(`Quote ${quote._id} was added by ${context.user.username}.`);
			} else {
				context.chat("bot", "No quote added!");
			}
		};
		
		let deleteQuote = async id => {
			if (context.user.admin) {
				let result = await Quote.deleteOne({_id: id});
				if (result.deletedCount > 0) {
					context.chat("bot", `Quote ${id} has been deleted.`);
					log.info(`Quote ${id} was deleted by ${context.user.username}.`);
				} else {
					context.chat("bot", "No quote deleted!");
				}
			} else {
				chat("bot", "Only moderators can delete quotes!");
			}
		};
		
		let showQuote = async quote => {
			if (quote) {
				context.chat("bot", `Quote ${quote._id}: ${quote.text} (${quote.createdAt.toDateString()})`);
			} else {
				context.chat("bot", "No quote found!");
			}
		};
		
		let searchQuote = async term => {
			let quotes = await Quote.find({text: {$regex: new RegExp(`.*${term}.*`, "i")}});
			if (quotes.length > 0) {
				let random = Math.floor(Math.random() * quotes.length);
				let quote = quotes[random];
				showQuote(quote);
			} else {
				context.chat("bot", "No quote found!");
			}
		};
		
		if (context.command == "addquote") {
			
			let text = context.message.trim();
			addQuote(text);
			
		} else if (context.command == "deletequote") {
			
			let id = context.parameters.length > 0? context.parameters[0]: null;
			deleteQuote(id);
			
		} else if (context.command == "searchquote") {
			
			let term = context.message.trim();
			searchQuote(term);
			
		} else if (context.command == "quote") {
			
			if (context.parameters.length > 0 && context.parameters[0].toLowerCase() == "add") {
				
				// Add quote
				let text = context.message.substring(3).trim();
				addQuote(text);
				
			} else if (context.parameters.length == 2 && 
					context.parameters[0].toLowerCase() == "delete" && 
					context.parameters[1].match(/^\d+$/)) {
				
				// Delete quote
				let id = context.parameters[1];
				deleteQuote(id);
				
			} else if (context.parameters.length > 0 && context.parameters[0].toLowerCase() == "search") {
				
				// Search quote
				let term = context.message.substring(6).trim();
				searchQuote(term);
				
			} else if (context.parameters.length == 1 && context.parameters[0].match(/^\d+$/)) {
				
				// Get quote
				let quote = await Quote.findOne({_id: context.parameters[0]});
				showQuote(quote);
				
			} else {
				
				// Get random quote
				let count = await Quote.countDocuments();
				let random = Math.floor(Math.random() * count);
				let quote = await Quote.findOne().skip(random);
				showQuote(quote);
				
			}
			
		}
		
	}
};
