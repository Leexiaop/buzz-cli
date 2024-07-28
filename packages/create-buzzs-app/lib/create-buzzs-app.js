"use strict";
const packageJson = require("../package.json");
const commander = require("commander");

function init() {
	const program = new commander.Command(packageJson.name).version(
		packageJson.version
	);
}

module.exports = {
	init,
};
