const tmi = require("tmi.js");
const log = require("./logger");
const parseCommand = require("./parseCommand");
const User = require("./models/user");

let settings;
let twitch;
let state = {};
let firstClient;
let channelMods = [];

let getChannelMods = async () => {
	try {
		let broadcasterId = (await twitch.users.getUserByName(settings.channel)).id;
		channelMods = (await twitch.moderation.getModerators(broadcasterId)).data.map(mod => mod.userName);
	} catch (error) {
		log.error(`Error while getting list of channel mods. Users will not have admin privileges: ${error}`);
	}
};

module.exports = async (io, plugins) => {
	settings = (await require("./settings")()).chatbot;
	twitch = await require("./twitch")();
	
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
	
	firstClient = clients[labels[0]];
	
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
			...channelMods, 
			settings.channel.toLowerCase()
		].includes(user.username);
		user.labels = labels.filter(label => clients[label].globaluserstate["user-id"] == user["user-id"]);
		return user;
	};
	
	// Define functions to use in plugins
	let pluginFunctions = {
		
		chat: (label, message) => {
			if (message) {
				getClient(label).say(settings.channel, message.toString());
			}
		},
		
		me: (label, message) => {
			if (message) {
				getClient(label).say(settings.channel, `/me ${message}`);
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
				io: io,
				twitch: twitch,
				plugins: plugins, 
				state: state
			};
		} else return null;
	}
	
	// Start monitoring channel live status
	twitch.streams.getStreamByUserName(settings.channel).then(stream => {
		let channelLive = stream != null;
		let monitoringInterval = settings.channelMonitoringIntervalMs || 1000 * 60 * 2
		
		setInterval(async () => {
			try {
				let channelLiveUpdated = (await twitch.streams.getStreamByUserName(settings.channel)) != null;
				if (channelLive != channelLiveUpdated) {
					channelLive = channelLiveUpdated;
					if (channelLive) plugins.event("chatbot.streamstart", {
						...pluginFunctions,
						io: io,
						twitch: twitch,
						plugins: plugins, 
						state: state
					});
					else plugins.event("chatbot.streamend", {
						...pluginFunctions,
						io: io,
						twitch: twitch,
						plugins: plugins, 
						state: state
					});
				}
			} catch (error) {
				log.error(`Couldn't get channel live status: ${error}`);
			}
		}, monitoringInterval);
	});
	
	// Only the first client loads chat-based modules
	firstClient.on("chat", async (target, user, msg) => {
		
		// Ignore commands from users with no ID (automated messages)
		if (!user["user-id"]) return;
		
		// Add DB props
		user = await getUser(user);
		
		const commandEvent = getCommandEvent(user, msg);
		
		plugins.event(`chatbot.message`, {
			user: user, 
			message: msg,
			commandEvent: commandEvent,
			...pluginFunctions,
			io: io,
			twitch: twitch,
			plugins: plugins, 
			state: state
		});
		
		if (commandEvent) {
			commandEvent.source = "chat";
			plugins.event("chatbot.command", commandEvent);
			plugins.event(`chatbot.command.{${commandEvent.command}}`, commandEvent);
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
				io: io,
				twitch: twitch,
				plugins: plugins, 
				state: state
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
					getChannelMods();
					setInterval(getChannelMods, 1000 * 60 * 15);
					
					plugins.event("chatbot.connect", {
						...pluginFunctions,
						twitch: twitch, 
						io: io,
						plugins: plugins, 
						state: state
					});
				}
			}
		});
		
		clients[label].connect();
	});
	
};
