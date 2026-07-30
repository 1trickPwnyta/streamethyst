const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const mai = require("mongoose-auto-increment");
const bodyParser = require("body-parser");
const path = require("path");
const log = require("./logger");
const plugins = new (require("./PluginManager"))();
const readline = require("readline");
const child_process = require("child_process");

// MongoDB
mongoose.connect("mongodb://localhost/streamethyst");
const connection = mongoose.createConnection("mongodb://localhost/streamethyst");
mai.initialize(connection);

// Express
const app = express();
const httpServer = http.createServer(app);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Routes
app.use("/", express.static("static"));
app.use("/overlay/*", express.static("static"));
/*app.route("/:overlay").get((req, res) => {
	res.sendFile(path.join(__dirname, "static", "index.html"));
});*/

let command;

(async () => {
	const settings = await require("./settings")();
	
	// Start server
	httpServer.listen(settings.serverPort, () => {
		log.info(`Server listening at http://localhost:${settings.serverPort}`);
	});

	// Start IO server
	const io = require("./io")(httpServer, plugins)();
	command = await require("./chatbot")(io, plugins);
})();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on("line", input => {
	switch (input.toLowerCase()) {
		case "/exit":
			process.exit(0);
			break;
		case "/help":
			console.log("Coming soon");
			break;
		default:
			if (command) {
				command(input);
			}
			break;
	}
});
