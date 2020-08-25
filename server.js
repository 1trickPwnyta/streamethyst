const express = require("express");
const http = require("http");
const io = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const settings = require("./settings");

require("./chatbot")();

// MongoDB
mongoose.connect("mongodb://localhost/streamethyst");

// Express
const app = express();
const httpServer = http.createServer(app);
const ioServer = io(httpServer);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Routes
app.use("/", express.static("static"));

// Start server
httpServer.listen(settings.serverPort, () => {
	console.log(`Server listening at http://localhost:${settings.serverPort}`);
});
