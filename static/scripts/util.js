function playSound(path, volume, loop) {
	let audio = document.createElement("audio");
	audio.src = path;
	audio.volume = volume;
	audio.loop = loop;
	audio.play();
}