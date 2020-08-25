const tmi = require("tmi.js");
const settings = require("./settings").chatbot;
const parseCommand = require("./parseCommand");

module.exports = plugins => {
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
	
	// Define chat function template to use in commands and plugins
	let getChatFunction = target => {
		return (label, message) => {
			// Respond with the specified client
			if (labels.length > 1) {
				clients[label].say(target, message);
			} else {
				clients["default"].say(target, message);
			}
		};
	};
	
	let firstClient = clients[labels[0]];
	
	// Only the first client loads command modules
	firstClient.on("message", (target, tags, msg) => {
		
		// Ignore users with no ID (automated messages)
		if (!tags["user-id"]) return;
		
		if (msg.startsWith(settings.commandPrefix)) {
			
			const {command, parameters} = parseCommand(msg);
			console.log(`Command "${command}" received.`);
			console.log(`Command parameters: ${parameters}`);
			
			plugins.event(`chatbot.command.{${command.substring(settings.commandPrefix.length)}}`, {
				tags: tags, 
				parameters: parameters, 
				message: msg.substring(msg.indexOf(" ") + 1),
				chat: getChatFunction(target)
			});
			
		}
		
	});
	
	// Connect all clients
	let clientsConnected = 0;
	labels.forEach(label => {
		
		clients[label].on("join", (target, username, self) => {
			if (self) {
				console.log(`${label} connected to chat on channel ${settings.channel}.`);
				
				// Load the chatbotInit plugin only after all clients have connected
				if (++clientsConnected == labels.length) {
					plugins.event("chatbot.connect", {
						chat: getChatFunction(target)
					});
				}
			}
		});
		
		clients[label].connect();
	});
	
};
