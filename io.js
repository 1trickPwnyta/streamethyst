const settings = require("./settings");
const uuid = require("./util").uuidv4;

module.exports = (httpServer, plugins) => {
	
	const io = require("socket.io")(httpServer);
	
	let ioFunctions = (overlay="default") => {
		return {
			
			getOverlayIo: otherOverlay => {
				return ioFunctions(otherOverlay);
			},
			
			playSound: (path, adtlData={}) => {
				io.in(overlay).emit("sound", {
					path: path,
					volume: adtlData.volume !== undefined? adtlData.volume: 1,
					loop: adtlData.loop !== undefined? adtlData.loop: false
				});
			},
			
			showVisual: (tagName, x, y, adtlData={}) => {
				
				let id = adtlData.id !== undefined? adtlData.id: uuid();
				
				io.in(overlay).emit("visual", {
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
			
			removeVisual: id => {
				io.in(overlay).emit("remove-visual", {
					id: id
				});
			},
			
			addStyle: css => {
				let id = uuid();
				io.in(overlay).emit("style", {
					id: id,
					css: css
				});
				return id;
			},
			
			removeStyle: id => {
				io.in(overlay).emit("remove-style", {
					id: id
				});
			},
			
			execute: code => {
				io.in(overlay).emit("script", {
					code: code
				});
			},
			
			getOverlaySize: () => {
				return {
					width: settings.overlay[overlay]? settings.overlay[overlay].width: settings.overlay.width,
					height: settings.overlay[overlay]? settings.overlay[overlay].height: settings.overlay.height
				};
			},
			
			signal: (id, data={}) => {
				plugins.event(`chatbot.signal.{${id}}`, {
					io: ioFunctions(),
					data: data
				});
			}
			
		};
	};
	
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
		let overlaySize = ioFunctions(overlay).getOverlaySize();
		socket.emit("script", {
			code: `
document.body.style.width = "${overlaySize.width}px";
document.body.style.height = "${overlaySize.height}px";
document.getElementById("main").innerHTML = "";
`
		});
		
		plugins.event(`overlay.{${overlay}}.load`, {
			io: ioFunctions(overlay)
		});
		
		socket.on("signal", data => {
			plugins.event(`overlay.signal.{${data.id}}`, {
				io: ioFunctions(overlay),
				data: data.data
			});
		});
		
	});
	
	return ioFunctions;
	
};
