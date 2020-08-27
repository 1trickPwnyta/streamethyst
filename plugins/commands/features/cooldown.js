const log = require("../../../logger");

module.exports = (options, plugin) => {
	
	plugin.lastUsed = null;
	plugin.userLastUsed = {};
	
	let action = plugin.action;
	plugin.action = context => {
		if (!options.globalCooldownSeconds || 
				!plugin.lastUsed || 
				plugin.lastUsed < Date.now() - options.globalCooldownSeconds*1000) {
					
			if (!options.userCooldownSeconds || 
					!plugin.userLastUsed[context.user["user-id"]] || 
					plugin.userLastUsed[context.user["user-id"]] < Date.now() - options.userCooldownSeconds*1000) {
			
				try {
					action(context);
				} catch (e) {
					log.debug("Command execution failed, but cooldown initiated anyway.");
				}
				plugin.lastUsed = Date.now();
				plugin.userLastUsed[context.user["user-id"]] = Date.now();
				
			} else {
				log.debug("Command skipped due to user cooldown.");
			}
			
		} else {
			log.debug("Command skipped due to global cooldown.");
		}
	};
	
	return plugin;
	
};
