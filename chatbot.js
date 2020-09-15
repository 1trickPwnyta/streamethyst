const tmi = require("tmi.js");
const settings = require("./settings").chatbot;
const log = require("./logger");
const parseCommand = require("./parseCommand");
const User = require("./models/user");

module.exports = (io, plugins) => {
	if (!settings) {
		log.warning("No settings.chatbot found. Chatbot will not connect.");
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
	
	let getClient = label => {
		if (label && labels.length > 1) return clients[label];
		else return clients["default"];
	};
	
	// Define functions to use in plugins
	let pluginFunctions = {
		
		chat: (label, message) => {
			if (message) {
				getClient(label).say(settings.channel, message.toString());
			}
		},
		
		whisper: (label, username, message) => {
			if (username && message) {
				getClient(label).whisper(username, message.toString());
			}
		}
		
	};
	
	let firstClient = clients[labels[0]];
	
	// Only the first client loads command modules
	firstClient.on("message", async (target, user, msg) => {
		
		// Add database user properties to user
		let dbUser = await User.findOne({userid: user["user-id"]});
		if (!dbUser) dbUser = await User.create({
			userid: user["user-id"],
			username: user.username
		});
		Object.assign(user, dbUser._doc);
		
		// Add admin property to user to indicate admin status (mod or channel owner)
		user.admin = user.mod || user["user-id"] == user["room-id"];
		
		plugins.event(`chatbot.message`, {
			user: user, 
			message: msg,
			...pluginFunctions,
			io: io
		});
		
		// Ignore commands from users with no ID (automated messages)
		if (!user["user-id"]) return;
		
		if (msg.startsWith(settings.commandPrefix)) {
			
			const {command, parameters} = parseCommand(msg);
			log.debug(`Command "${command}" received.`);
			log.debug(`Command parameters: ${parameters}`);
			
			let commandName = command.substring(settings.commandPrefix.length).toLowerCase();
			let message = msg.includes(" ")? 
				msg.substring(msg.indexOf(" ") + 1): 
				"";
			
			const event = {
				user: user, 
				command: commandName,
				parameters: parameters, 
				message: message,
				...pluginFunctions,
				io: io
			};
			
			plugins.event("chatbot.command", event);
			plugins.event(`chatbot.command.{${commandName}}`, event);
			
		}
		
	});
	
	// Connect all clients
	let clientsConnected = 0;
	labels.forEach(label => {
		
		clients[label].on("join", (target, username, self) => {
			if (self) {
				log.info(`${label} connected to chat on channel ${settings.channel}.`);
				
				// Load the chatbotInit plugin only after all clients have connected
				if (++clientsConnected == labels.length) {
					plugins.event("chatbot.connect", {
						...pluginFunctions
					});
				}
			}
		});
		
		clients[label].connect();
	});
	
};
