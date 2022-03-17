const path = require("path");
const fs = require("fs");
const log = require("./logger");

class PluginManager {
	constructor() {
		this.plugins = {};
		
		const pluginPath = path.join(__dirname, "plugins");
		
		// Function to recursively find files in the plugins folder
		var walk = function(dir, done) {
			var results = [];
			fs.readdir(dir, function(err, list) {
				if (err) return done(err);
				var pending = list.length;
				if (!pending) return done(null, results);
				list.forEach(file => {
					file = path.resolve(dir, file);
					fs.stat(file, function(err, stat) {
						if (stat && stat.isDirectory()) {
							walk(file, function(err, res) {
								results = results.concat(res);
								if (!--pending) done(null, results);
							});
						} else {
							results.push(path.relative(pluginPath, file));
							if (!--pending) done(null, results);
						}
					});
				});
			});
		};
		
		// Load all plugins from the plugins folder
		walk(pluginPath, (err, results) => {
			results.forEach(file => {
				if (file.endsWith(".js")) {
					try {
						let plugin = require(`./plugins/${file}`);
						if (!Array.isArray(plugin)) plugin = [plugin];
						let loaded = false;
						plugin.forEach(module => {
							if (module.enabled) {
								if (!Array.isArray(module.event)) module.event = [module.event];
								module.event.forEach(event => {
									event = event.toLowerCase();
									if (!this.plugins[event]) {
										this.plugins[event] = [];
									}
									this.plugins[event].push({
										action: module.action,
										file: file
									});
								});
								loaded = true;
							}
						});
						if (loaded) log.info(`Loaded plugin "${file}".`);
					} catch (e) {
						log.error(`Failed to load plugin "${file}". ${e.stack}`);
					}
				}
			});
		});
		
	}
	
	event(event, context) {
		event = event.toLowerCase();
		log.debug(`Event received: ${event}`);
		if (this.plugins[event]) {
			this.plugins[event].forEach(plugin => {
				try {
					log.debug(`Calling plugin ${plugin.file}.`);
					plugin.action(context);
					log.debug(`Plugin ${plugin.file} executed successfully.`);
				} catch (e) {
					log.error(`Plugin ${plugin.file} failed. ${e.stack}`);
				}
			});
		}
	}
}

module.exports = PluginManager;
