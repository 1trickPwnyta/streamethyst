module.exports = httpServer => {
	
	const io = require("socket.io")(httpServer);
	
	return {
		
		playSound: path => {
			io.emit("sound", {
				path: path,
				volume: 1,
				loop: false
			});
		}
		
	}
	
};
