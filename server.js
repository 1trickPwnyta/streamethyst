const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const mai = require("mongoose-auto-increment");
const bodyParser = require("body-parser");
const path = require("path");
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
app.use("/overlay/*", express.static("static"));
/*app.route("/:overlay").get((req, res) => {
	res.sendFile(path.join(__dirname, "static", "index.html"));
});*/

// Start server
httpServer.listen(settings.serverPort, () => {
	log.info(`Server listening at http://localhost:${settings.serverPort}`);
});

// Start IO server
const io = require("./io")(httpServer);
require("./chatbot")(plugins, io);
