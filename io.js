const settings = require("./settings");
const uuid = require("./util").uuidv4;

module.exports = httpServer => {
	
	const io = require("socket.io")(httpServer);
	
	io.on("connection", () => {
		// Set the size of the overlay and clear its contents
		io.emit("script", {
			code: `
document.body.style.width = "${settings.overlay.width}px";
document.body.style.height = "${settings.overlay.height}px";
document.getElementById("main").innerHTML = "";
`
		});
	});
	
	return {
		
		playSound: (path, volume=1) => {
			io.emit("sound", {
				path: path,
				volume: volume,
				loop: false
			});
		},
		
		showVisual: (tagName, x, y, adtlData={}) => {
			
			let id = adtlData.id? adtlData.id: uuid();
			
			io.emit("visual", {
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
			io.emit("remove-visual", {
				id: id
			});
		}
		
	}
	
};
