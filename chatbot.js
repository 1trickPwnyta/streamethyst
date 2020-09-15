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
	
	// Get the client corresponding to a label
	let getClient = label => {
		if (label && labels.length > 1) return clients[label];
		else return clients["default"];
	};
	
	let firstClient = clients[labels[0]];
	
	// Add database user properties to user
	let getUser = async user => {
		let dbUserProps = {
			userid: user["user-id"],
			username: user.username,
			displayName: user["display-name"]
		};
		let dbUser = await User.findOne({userid: dbUserProps.userid});
		if (!dbUser) {
			dbUser = await User.create(dbUserProps);
		} else {
			Object.assign(dbUser, dbUserProps);
			dbUser.save();
		}
		Object.assign(user, dbUser._doc);
		user.admin = [
			...(await firstClient.mods(settings.channel)), 
			settings.channel.toLowerCase()
		].includes(user.username);
		return user;
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
	
	// Parse and return a command event
	let getCommandEvent = (user, msg) => {
		if (msg.startsWith(settings.commandPrefix)) {
			const {command, parameters} = parseCommand(msg);
			log.debug(`Command "${command}" received.`);
			log.debug(`Command parameters: ${parameters}`);
			
			let commandName = command.substring(settings.commandPrefix.length).toLowerCase();
			let message = msg.includes(" ")? 
				msg.substring(msg.indexOf(" ") + 1): 
				"";
			
			return {
				user: user,
				command: commandName,
				parameters: parameters, 
				message: message,
				...pluginFunctions,
				io: io
			};
		} else return null;
	}
	
	// Only the first client loads chat-based modules
	firstClient.on("chat", async (target, user, msg) => {
		
		// Ignore commands from users with no ID (automated messages)
		if (!user["user-id"]) return;
		
		// Add DB props
		user = await getUser(user);
		
		plugins.event(`chatbot.message`, {
			user: user, 
			message: msg,
			...pluginFunctions,
			io: io
		});
		
		const event = getCommandEvent(user, msg);
		if (event) {
			event.source = "chat";
			plugins.event("chatbot.command", event);
			plugins.event(`chatbot.command.{${event.command}}`, event);
		}
		
	});
	
	labels.forEach(label => {
		clients[label].on("whisper", async (from, user, msg) => {
			
			// Ignore commands from users with no ID (automated messages)
			if (!user["user-id"]) return;
			
			user = await getUser(user);
			
			plugins.event(`chatbot.{${label}}.whisper`, {
				user: user, 
				message: msg,
				...pluginFunctions,
				io: io
			});
			
			const event = getCommandEvent(user, msg);
			if (event) {
				event.source = "whisper";
				plugins.event("chatbot.command", event);
				plugins.event(`chatbot.command.{${event.command}}`, event);
			}
			
		});
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
