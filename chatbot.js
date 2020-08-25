const tmi = require("tmi.js");
const settings = require("./settings").chatbot;
const parseCommand = require("./parseCommand");

module.exports = () => {
	if (!settings.credentials) {
		console.log("No settings.chatbot.credentials found. Chatbot will not connect.");
		return;
	}
	
	if (!settings.channel) {
		console.log("No settings.chatbot.channel found. Chatbot will not connect.");
		return;
	}
	
	let labels, clients = {};
	if (settings.credentials.username && settings.credentials.password) {
		
		labels = ["default"];
		clients["default"] = new tmi.client({
			identity: {
				username: settings.credentials.username,
				password: settings.credentials.password
			},
			channels: [
				settings.channel
			],
			connection: {
				reconnect: true
			}
		});
		
	} else {
		
		labels = Object.keys(settings.credentials);
		labels.forEach(label => {
			const credential = settings.credentials[label];
			clients[label] = new tmi.client({
				identity: {
					username: credential.username,
					password: credential.password
				},
				channels: [
					settings.channel
				],
				connection: {
					reconnect: true
				}
			});
		});
		
	};
	
	// Only the first client loads command modules
	clients[labels[0]].on("message", (target, context, msg) => {
		
		// Ignore users with no ID (automated messages)
		if (!context["user-id"]) return;
		
		if (msg.startsWith(settings.commandPrefix)) {
			
			const {command, parameters} = parseCommand(msg);
			console.log(`Command "${command}" received.`);
			console.log(`Command parameters: ${parameters}`);
			
			try {
				require(`./commands/${command.substring(settings.commandPrefix.length)}`)({
					context: context, 
					parameters: parameters, 
					message: msg.substring(msg.indexOf(" ") + 1),
					respond: (label, message) => {
						// Respond with the specified client
						if (labels.length > 1) {
							clients[label].say(target, message);
						} else {
							clients["default"].say(target, message);
						}
					}
				});
			} catch (e) {
				if (e.code == "MODULE_NOT_FOUND") {
					console.log(`Command "${command}" ignored.`);
				} else {
					throw e;
				}
			}
			
		}
		
	});
	
	// Connect all clients
	labels.forEach(label => {
		clients[label].on("connected", () => {
			console.log(`${label} connected to chat on channel ${settings.channel}.`);
		});
		clients[label].connect();
	});
	
};
