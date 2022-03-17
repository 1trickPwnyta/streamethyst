module.exports = {
	getUserByUsername: username => {
		return {
			username: username.replace(/^@*/, "")
		};
	}
};
