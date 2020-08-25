module.exports = s => {
	const spacePlaceholder = "-%SPACE%-";
	let inQuotes = false;
	let precedingSlashes = 0;
	for (let i = 0; i < s.length; i++) {
		let c = s[i];
		if (c == "\\" && inQuotes) {
			precedingSlashes++;
		} else {
			if (c == " " && inQuotes) {
				s = s.substring(0, i) + spacePlaceholder + s.substring(i + 1);
			} else if (c == "\"") {
				if (!inQuotes) {
					inQuotes = true;
				} else if (precedingSlashes % 2 == 0) {
					inQuotes = false;
				}
			}
			precedingSlashes = 0;
		}
	}
	let msgParts = s.split(" ");
	for (let i = 0; i < msgParts.length; i++) {
		if (msgParts[i].startsWith("\"") && msgParts[i].endsWith("\"")) {
			msgParts[i] = msgParts[i].substring(1, msgParts[i].length - 1);
		}
		msgParts[i] = msgParts[i].replace(/\\\\/g, "\\").replace(/\\"/g, "\"");
		msgParts[i] = msgParts[i].replace(new RegExp(spacePlaceholder,"g"), " ");
	}
	
	let command = msgParts[0]
	let parameters = msgParts.slice(1);
	
	return {
		command: command,
		parameters: parameters
	};
};
