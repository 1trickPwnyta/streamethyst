const path = require("path");
const fs = require("fs");

class PluginManager {
	constructor() {
		this.plugins = {};
		
		const pluginPath = path.join(__dirname, "plugins");
		
		// Function to recursively find files in the plugins directory
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
		
		walk(pluginPath, (err, results) => {
			results.forEach(file => {
				if (file.endsWith(".js")) {
					let plugin = require(`./plugins/${file}`);
					if (plugin.enabled) {
						if (!this.plugins[plugin.event]) {
							this.plugins[plugin.event] = [];
						}
						this.plugins[plugin.event].push(plugin.action);
						console.log(`Loaded plugin "${file}".`);
					}
				}
			});
		});
		
	}
	
	event(event, context) {
		console.log(`Event received: ${event}`);
		if (this.plugins[event]) {
			this.plugins[event].forEach(plugin => plugin(context));
		}
	}
}

module.exports = PluginManager;
