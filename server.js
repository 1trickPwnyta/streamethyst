const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const mai = require("mongoose-auto-increment");
const bodyParser = require("body-parser");
const settings = require("./settings");
const log = require("./logger");
const plugins = new (require("./PluginManager"))();

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

// Start server
httpServer.listen(settings.serverPort, () => {
	log.info(`Server listening at http://localhost:${settings.serverPort}`);
});

// Start IO server
const io = require("./io")(httpServer);
require("./chatbot")(plugins, io);