function playSound(path, volume=1, loop=false) {
	let audio = document.createElement("audio");
	audio.src = path;
	audio.volume = volume;
	audio.loop = loop;
	audio.play();
}