"use strict";
const chalk = require("chalk");
const packageJson = require("../package.json");
const commander = require("commander");

function init() {
    const program = new commander.Command(packageJson.name)
        .version(packageJson.version)
        .arguments('<project-directory>')
        .usage(`${chalk.green('<project-directory>')}`)
        .action(name => {
            console.log(name)
        }).parse(process.argv);
}

module.exports = {
	init,
};
