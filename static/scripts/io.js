let socket = io();

socket.on("sound", data => {
	playSound(`./audio/${data.path}`, data.volume, data.loop);
});

socket.on("visual", data => {
	let main = document.getElementById("main");
	
	let visual = document.createElement(data.tagName);
	visual.id = data.id;
	if (data.className) visual.className = data.className;

	if (data.style) {
		Object.keys(data.style).forEach(key => {
			visual.style[key] = data.style[key];
		});
	}
	
	visual.style.display = "block";
	visual.style.position = "absolute";
	visual.style.left = `${data.x}px`;
	visual.style.top = `${data.y}px`;
	
	if (data.html) visual.innerHTML = data.html;
	
	if (data.props) {
		Object.keys(data.props).forEach(key => {
			visual[key] = data.props[key];
		});
	}
	
	visual.transitionData = data.transition;
	
	if (visual.transitionData && visual.transitionData.into) {
		let transition = visual.transitionData.into;
		
		visual.style.transitionDuration = `${transition.seconds}s`;
		let startTransition = () => {};
		
		switch (transition.type) {
			case "fade":
				visual.style.transitionProperty = "opacity";
				visual.style.opacity = 0;
				startTransition = () => visual.style.opacity = 1;
				break;
			case "slide":
				visual.style.transitionProperty = "left";
				switch (transition.direction) {
					case "left":
						visual.style.left = `${document.body.scrollWidth}px`;
						startTransition = () => visual.style.left = `${data.x}px`;
						break;
					case "right":
						visual.style.left = visual.style.width;
						startTransition = () => visual.style.left = `${data.x}px`;
						break;
				}
				break;
			default:
				console.error(`Invalid transition: ${transition.type}`);
				break;
		}
		
		main.appendChild(visual);
		
		// Must add artificial delay before setting transition properties to final values
		window.setTimeout(startTransition, 60);
		
	} else {
		
		main.appendChild(visual);
		
	}
});

socket.on("remove-visual", data => {
	let main = document.getElementById("main");
	
	let visual = document.getElementById(data.id);
	
	if (visual.transitionData && visual.transitionData.out) {
		let transition = visual.transitionData.out;
		
		visual.style.transitionDuration = `${transition.seconds}s`;
		let startTransition = () => {};
		
		switch (transition.type) {
			case "fade":
				visual.style.transitionProperty = "opacity";
				startTransition = () => visual.style.opacity = 0;
				break;
			case "slide":
				visual.style.transitionProperty = "left";
				switch (transition.direction) {
					case "left":
						startTransition = () => visual.style.left = visual.style.width;
						break;
					case "right":
						startTransition = () => visual.style.left = `${document.body.scrollWidth}px`;
						break;
				}
				break;
			default:
				console.error(`Invalid transition: ${transition.type}`);
				break;
		}
		
		
		// Must add artificial delay before setting transition properties to final values
		window.setTimeout(startTransition, 60);
		
		window.setTimeout(() => visual.parentNode.removeChild(visual), 60 + transition.seconds*1000);
		
	} else {
		
		visual.parentNode.removeChild(visual);
		
	}
});

socket.on("script", data => {
	eval(data.code);
});
