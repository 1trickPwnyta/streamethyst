module.exports = httpServer => {
	
	const io = require("socket.io")(httpServer);
	
	return {
		
		playSound: (path, volume=1) => {
			io.emit("sound", {
				path: path,
				volume: volume,
				loop: false
			});
		}
		
	}
	
};
