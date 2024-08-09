'use strict';
const chalk = require('chalk');
const packageJson = require('../package.json');
const commander = require('commander');
const https = require('https');
const envinfo = require('envinfo');
const semver = require('semver');

let projectName = '';
const init = () => {
	const program = new commander.Command(packageJson.name)
		.version(packageJson.version)
		.arguments('<project-directory>')
		.usage(`${chalk.green('<project-directory>')} [options]`)
		.action((name) => {
			projectName = name;
		})
		.option('--verbose', 'print additional logs')
		.parse(process.argv);

	if (program.info) {
		console.log(chalk.bold('\nEnvironment Info:'));
		console.log(
			`\n  current version of ${packageJson.name}: ${packageJson.version}`
		);
		console.log(`  running from ${__dirname}`);
		return envinfo
			.run(
				{
					System: ['OS', 'CPU'],
					Binaries: ['Node', 'npm', 'Yarn'],
					Browsers: [
						'Chrome',
						'Edge',
						'Internet Explorer',
						'Firefox',
						'Safari'
					],
					// npmPackages: ["react", "react-dom", "react-scripts"],
					npmGlobalPackages: ['create-buzzs-app']
				},
				{
					duplicates: true,
					showNotFound: true
				}
			)
			.then(console.log);
	}

	if (!projectName.trim() || typeof projectName !== 'string') {
		console.error('Please specify the project directory:');
		console.log(
			`  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
		);
		console.log();
		console.log('For example:');
		console.log(
			`  ${chalk.cyan(program.name())} ${chalk.green('my-buzzs-app')}`
		);
		console.log();
		console.log(
			`Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
		);
		process.exit(1);
	}
	checkForLatestVersion().then((res) => {
		if (res && semver.lt(packageJson.version, res)) {
			console.log();
			console.error(
				chalk.yellow(
					`You are running \`create-buzzs-app\` ${packageJson.version}, which is behind the latest release (${res}).\n\n`
						+ 'We recommend always using the latest version of create-buzzs-app if possible.'
				)
			);
			console.log();
			console.log(
				'The latest instructions for creating a new app can be found here:\n'
					+ 'https://www.ibadgers.cn/buzzs-cli/'
			);
			console.log();
		} else {
			const useYarn = isUsingYarn();
			createApp(
				projectName,
				program.verbose,
				program.scriptsVersion,
				program.template,
				useYarn,
				program.usePnp
			);
		}
	});
	const isUsingYarn = () => {
		return (process.env.npm_config_user_agent || '').indexOf('yarn') === 0;
	};

	const createApp = (name, verbose, version, template, useYarn, usePnp) => {
		console.log(name, verbose, version, template, useYarn, usePnp);
	};
};

const checkForLatestVersion = () => {
	return new Promise((resolve, reject) => {
		https
			.get(
				'https://registry.npmjs.org/-/package/create-react-app/dist-tags',
				(res) => {
					console.log(res);
					if (res.statusCode === 200) {
						let body = '';
						res.on('data', (data) => (body += data));
						res.on('end', () => {
							resolve(JSON.parse(body).latest);
						});
					} else {
						reject(new Error('出错了'));
					}
				}
			)
			.on('error', () => reject(new Error('出错了')));
	});
};

module.exports = {
	init
};
