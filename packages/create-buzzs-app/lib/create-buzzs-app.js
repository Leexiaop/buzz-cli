'use strict';
const chalk = require('chalk');
const packageJson = require('../package.json');
const commander = require('commander');
const https = require('https');
const envinfo = require('envinfo');
const semver = require('semver');
const path = require('path');
const validateProjectName = require('validate-npm-package-name');
const fs = require('fs-extra');
const os = require('os');
const execSync = require('child_process').execSync;
const spawn = require('cross-spawn');

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
					npmGlobalPackages: ['create-buzzs-app', 'buzzs', 'react', 'react-dom', 'react-scripts']
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
	const useYarn = isUsingYarn();
	createApp(
		projectName,
		program.verbose,
		program.scriptsVersion,
		program.template,
		useYarn,
		program.usePnp
	);
	// checkForLatestVersion().then((res) => {
	// 	if (res && semver.lt(packageJson.version, res)) {
	// 		console.log();
	// 		console.error(
	// 			chalk.yellow(
	// 				`You are running \`create-buzzs-app\` ${packageJson.version}, which is behind the latest release (${res}).\n\n`
	// 					+ 'We recommend always using the latest version of create-buzzs-app if possible.'
	// 			)
	// 		);
	// 		console.log();
	// 		console.log(
	// 			'The latest instructions for creating a new app can be found here:\n'
	// 				+ 'https://www.ibadgers.cn/create-buzzs-app/'
	// 		);
	// 		console.log();
	// 	} else {
	// 		const useYarn = isUsingYarn();
	// 		createApp(
	// 			projectName,
	// 			program.verbose,
	// 			program.scriptsVersion,
	// 			program.template,
	// 			useYarn,
	// 			program.usePnp
	// 		);
	// 	}
	// });
};

const isUsingYarn = () => {
	return (process.env.npm_config_user_agent || '').indexOf('yarn') === 0;
};

const createApp = (name, verbose, version, template, useYarn, usePnp) => {
	const unsportedNodeVersion = !semver.satisfies(semver.coerce(process.version), '>=14');
	if (unsportedNodeVersion) {
		console.log(chalk.yellow(`You are useing Node ${process.version} so the project will be bootstrapped with an old unsupported version of tools.\n\n Please update to Node 14 or higher for a better, fully supported experience.\n`));
	}
	const root = path.resolve(name);
	const appName = path.basename(root);
	checkAppName(appName);
	// 检查name目录存在不，如果不存在就创建该目录
	fs.ensureDirSync(name);
	// 检查已经存在的{name}文件夹是不是干净的，有没有可能造成冲突的文件目录
	if (!isSafeToCreateProjectIn(root, name)) {
		process.exit(1);
	}

	console.log(`Create a new Buzzs app in ${chalk.green(root)}`);

	const packageJson = {
		name: appName,
		version: '0.1.0',
		private: true
	};
	fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2) + os.EOL);
	console.log(process.cwd());
	const originalDirectory = process.cwd();
	//  变更node工作的进程目录
	process.chdir(root);
	//  检查系统配置
	if (!useYarn && !checkThatNpmCanReadCwd()) {
		process.exit(1);
	}

	if (!useYarn) {
		const npmInfo = checkNpmVersion();
		console.log(npmInfo);
	}
};

const checkNpmVersion = () => {
	let hasMinNpm = false;
	let npmVersion = null;
	try {
		npmVersion = execSync('npm --version').toString().trim();
		hasMinNpm = semver.gte(npmVersion, '6.0.0');
	} catch (e) {
		console.log(e);
	}
	return {
		hasMinNpm, npmVersion
	};
};

const checkThatNpmCanReadCwd = () => {
	const cwd = process.cwd();
	let childOutput = null;
	try {
		childOutput = spawn.sync('npm', ['config', 'list']).output.join('');
	} catch (e) {
		return true;
	}
	if (typeof childOutput !== 'string') {
		return true;
	}
	let lines = childOutput.split('\n');
	const prefix = '; cwd = ';
	const line = lines.find(line => line.startsWith(prefix));
	if (typeof line !== 'string') {
		return true;
	}
	const npmCWD = line.substring(prefix.length);
	if (npmCWD === cwd) {
		return true;
	}
	console.error(
		chalk.red(
			'Could not start an npm process in the right directory.\n\n'
            + `The current directory is: ${chalk.bold(cwd)}\n`
            + `However, a newly started npm process runs in: ${chalk.bold(
            	npmCWD
            )}\n\n`
            + 'This is probably caused by a misconfigured system terminal shell.'
		)
	);
	if (process.platform === 'win32') {
		console.error(
			chalk.red('On Windows, this can usually be fixed by running:\n\n')
            + `  ${chalk.cyan(
            	'reg'
            )} delete "HKCU\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n`
            + `  ${chalk.cyan(
            	'reg'
            )} delete "HKLM\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n\n`
            + chalk.red('Try to run the above two lines in the terminal.\n')
            + chalk.red(
            	'To learn more about this problem, read: https://blogs.msdn.microsoft.com/oldnewthing/20071121-00/?p=24433/'
            )
		);
	}
	return false;
};

const isSafeToCreateProjectIn = (root, name) => {
	const validFiles = [
		'.DS_Store',
		'.git',
		'.gitattributes',
		'.gitignore',
		'.gitlab-ci.yml',
		'.hg',
		'.hgcheck',
		'.hgignore',
		'.idea',
		'.npmignore',
		'.travis.yml',
		'docs',
		'LICENSE',
		'README.md',
		'mkdocs.yml',
		'Thumbs.db'
	];

	const errorLogFilePatterns = [
		'npm-debug.log',
		'yarn-error.log',
		'yarn-debug.log'
	];

	const isErrorLog = file => {
		return errorLogFilePatterns.some(pattern => file.startsWith(pattern));
	};

	const conflicts = fs.readdirSync(root)
	    //  过滤掉validFiles中的文件
		.filter(file => !validFiles.includes(file))
	//  过滤掉由开发工具创建的一些iml为扩展名的文件
		.filter(file => !/\.iml$/.test(file))
	//  过滤掉曾经创建的一些日志文件，以免造成冲突
		.filter(file => !isErrorLog(file));

	if (conflicts.length > 0) {
		console.log(`This directory ${chalk.green(name)} contains files that could conflict:`);
		for (const file of conflicts) {
			try {
				// 获取冲突文件的路的类型
				const stats = fs.latestSync(path.join(root, file));
				if (stats.isDirectory()) {
					console.log(`  ${chalk.blue(`${file}/`)}`);
				} else {
					console.log(`  ${file}`);
				}
			} catch (e) {
				console.log(`  ${file}`);
			}
			console.log(
				'Either try using a new directory name, or remove the files listed above.'
			);

			return false;
		}
	}
	fs.readdirSync(root).forEach(file => {
		if (isErrorLog(file)) {
			//  通过遍历将所有造成的冲突日志文件删除
			fs.removeSync(path.join(root, file));
		}
	});
	return true;
};

const checkAppName = (appName) => {
	const validationResult = validateProjectName(appName);
	if (!validationResult.validForNewPackages) {
		console.log(chalk.red(`Cannot create a project named ${appName} because of npm naming restrictions:\n`));
		[
			...(validationResult.errors || []),
			...(validationResult.warnings || [])
		].forEach(error => {
			console.error(chalk.red(` * ${error}`));
		});
		console.error(chalk.red('\nPlease choose a different project name!'));

		process.exit(1);
	}
	const dependencies = ['react', 'react-dom', 'react-scripts'].sort();
	if (dependencies.includes(appName)) {
		console.error(
			chalk.red(
              `Cannot create a project named ${chalk.green(
                `"${appName}"`
              )} because a dependency with the same name exists.\n`
                + 'Due to the way npm works, the following names are not allowed:\n\n'
			)
              + chalk.cyan(dependencies.map(depName => `  ${depName}`).join('\n'))
              + chalk.red('\n\nPlease choose a different project name.')
		);
		process.exit(1);
	}
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
