let socket = io();

socket.on("sound", function(data) {
	playSound(`./audio/${data.path}`, data.volume, data.loop);
});

