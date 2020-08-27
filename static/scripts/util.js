let socket = io();

socket.on("sound", function(data) {
	let audio = document.createElement("audio");
	audio.src = `./audio/${data.path}`;
	audio.volume = data.volume;
	audio.loop = data.loop;
	audio.play();
});
