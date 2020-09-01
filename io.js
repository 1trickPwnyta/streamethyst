const settings = require("./settings");
const uuid = require("./util").uuidv4;

module.exports = (httpServer, name="") => {
	
	const io = require("socket.io")(httpServer);
	
	io.on("connection", socket => {
		
		// Join socket to room based on URL path overlay regex
		let re = /^https?:\/\/.*\/overlay\/([^\/]+)\/?/;
		let referer = socket.handshake.headers.referer;
		let overlay = "default";
		if (referer.match(re)) {
			overlay = referer.replace(re, "$1");
		}
		socket.join(overlay);
		
		// Set the size of the overlay and clear its contents
		socket.emit("script", {
			code: `
document.body.style.width = "${settings.overlay.width}px";
document.body.style.height = "${settings.overlay.height}px";
document.getElementById("main").innerHTML = "";
`
		});
		
	});
	
	return {
		
		playSound: (path, adtlData={}) => {
			io.in(adtlData.overlay !== undefined? adtlData.overlay: "default").emit("sound", {
				path: path,
				volume: adtlData.volume !== undefined? adtlData.volume: 1,
				loop: adtlData.loop !== undefined? adtlData.loop: false
			});
		},
		
		showVisual: (tagName, x, y, adtlData={}) => {
			
			let id = adtlData.id !== undefined? adtlData.id: uuid();
			
			io.in(adtlData.overlay !== undefined? adtlData.overlay: "default").emit("visual", {
				tagName: tagName,
				id: id,
				className: adtlData.className,
				style: adtlData.style,
				props: adtlData.props,
				transition: adtlData.transition,
				x: x,
				y: y,
				html: adtlData.html
			});
			
			return id;
		},
		
		removeVisual: (id, adtlData={}) => {
			io.in(adtlData.overlay !== undefined? adtlData.overlay: "default").emit("remove-visual", {
				id: id
			});
		}
		
	}
	
};
