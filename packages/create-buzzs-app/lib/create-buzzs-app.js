'use strict';
const chalk = require('chalk');
const packageJson = require('../package.json');
const commander = require('commander');

let projectName = '';
function init() {
	const program = new commander.Command(packageJson.name)
		.version(packageJson.version)
		.arguments('<project-directory>')
		.usage(`${chalk.green('<project-directory>')} [options]`)
		.action(name => {
			projectName = name;
		})
		.option('--info', 'print environment debug info')
		.parse(process.argv);
	console.log(program.info, 444);
	console.log(projectName);
}

module.exports = {
	init
};
