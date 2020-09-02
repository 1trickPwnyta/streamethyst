const log = require("../../../logger");
const settings = require("../../../settings");

module.exports = (options, plugin) => {
	
	plugin.lastUsed = null;
	plugin.userLastUsed = {};
	
	let action = plugin.action;
	plugin.action = context => {
		
		let globalCooldownSecondsRemaining = Math.floor((!(options.adminOverride && context.user.admin) && 
				options.globalCooldownSeconds? options.globalCooldownSeconds*1000 - (Date.now() - plugin.lastUsed): 0)/1000);
		let userCooldownSecondsRemaining = Math.floor((!(options.adminOverride && context.user.admin) && 
				options.userCooldownSeconds && plugin.userLastUsed[context.user["user-id"]]? 
				options.userCooldownSeconds*1000 - (Date.now() - plugin.userLastUsed[context.user["user-id"]]): 0)/1000);
		let cooldownSecondsRemaining = Math.max(globalCooldownSecondsRemaining, userCooldownSecondsRemaining);
		
		if (globalCooldownSecondsRemaining <= 0) {	
			if (userCooldownSecondsRemaining <= 0) {
				
				plugin.lastUsed = Date.now();
				plugin.userLastUsed[context.user["user-id"]] = Date.now();
				
				try {
					action(context);
				} catch (e) {
					log.debug("Command execution failed, but cooldown initiated anyway.");
					throw e;
				}
				
			} else {
				log.debug("Command skipped due to user cooldown.");
			}
		} else {
			log.debug("Command skipped due to global cooldown.");
		}
		
		if (cooldownSecondsRemaining > 0 && options.verbose) {
			let diff = cooldownSecondsRemaining;
			
			let hours = Math.floor(diff / (60 * 60));
			diff -= hours * (60 * 60);

			let mins = Math.floor(diff / 60);
			diff -= mins * 60;

			let seconds = Math.floor(diff);
			diff -= seconds;
			
			context.chat("bot", `@${context.user["display-name"]}, please wait 
					${("00" + hours).slice(-2)}:${("00" + mins).slice(-2)}:${("00" + seconds).slice(-2)}
					to use ${settings.chatbot.commandPrefix}${context.command}.`);
		}
	};
	
	return plugin;
	
};
