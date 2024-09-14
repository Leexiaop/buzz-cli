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
const dns = require('dns');
const execSync = require('child_process').execSync;
const spawn = require('cross-spawn');
const prompts = require('prompts');
const hyperquest = require('hyperquest');
const tmp = require('tmp');
const unpack = require('tar-pack').unpack;

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
	// const useYarn = isUsingYarn();
	// createApp(
	// 	projectName,
	// 	program.verbose,
	// 	program.scriptsVersion,
	// 	program.template,
	// 	useYarn,
	// 	program.usePnp
	// );
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
					+ 'https://www.ibadgers.cn/create-buzzs-app/'
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
};

const isUsingYarn = () => {
	return (process.env.npm_config_user_agent || '').indexOf('yarn') === 0;
};

const createApp = (name, verbose, version, template, useYarn, usePnp) => {
	const unsportedNodeVersion = !semver.satisfies(semver.coerce(process.version), '>=14');
	if (unsportedNodeVersion) {
		console.log(chalk.yellow(`You are useing Node ${process.version} so the project will be bootstrapped with an old unsupported version of tools.\n\n Please update to Node 14 or higher for a better, fully supported experience.\n`));
		version = 'react-scripts@0.9.x';
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
		if (!npmInfo.hasMinNpm) {
			if (npmInfo.npmVersion) {
				console.log(
					chalk.yellow(
                        `You are using npm ${npmInfo.npmVersion} so the project will be bootstrapped with an old unsupported version of tools.\n\n`
                        + 'Please update to npm 6 or higher for a better, fully supported experience.\n'
					)
				);
			}
			version = 'react-scripts@0.9.x';
		}
	} else if (usePnp) {
		const yarnInfo = checkYarnVersion();
		if (yarnInfo.yarnVersion) {
			if (!yarnInfo.hasMinYarnPnp) {
				console.log(
					chalk.yellow(
                `You are using Yarn ${yarnInfo.yarnVersion} together with the --use-pnp flag, but Plug'n'Play is only supported starting from the 1.12 release.\n\n`
                  + 'Please update to Yarn 1.12 or higher for a better, fully supported experience.\n'
					)
				);
				usePnp = false;
			}
			if (!yarnInfo.hasMaxYarnPnp) {
				console.log(
					chalk.yellow(
						'The --use-pnp flag is no longer necessary with yarn 2 and will be deprecated and removed in a future release.\n'
					)
				);
				usePnp = false;
			}
		}
	}
	run(
		root,
		appName,
		version,
		verbose,
		originalDirectory,
		template,
		useYarn,
		usePnp
	);
};

const run = (root, appName,	version, verbose, originalDirectory, template, useYarn,	usePnp) => {
	Promise.all([
		getInstallPackage(version, originalDirectory),
		getTemplateInstallPackage(template, originalDirectory)
	]).then(([packageToInstall, templateToInstall]) => {
		const allDependencies = ['react', 'react-dom', packageToInstall];

		console.log('Installing packages. This might take a couple of minutes.');

		Promise.all([
			getPackageInfo(packageToInstall),
			getPackageInfo(templateToInstall)
		])
			.then(([packageInfo, templateInfo]) =>
				checkIfOnline(useYarn).then(isOnline => ({
					isOnline,
					packageInfo,
					templateInfo
				}))
			)
			.then(({ isOnline, packageInfo, templateInfo }) => {
				let packageVersion = semver.coerce(packageInfo.version);

				const templatesVersionMinimum = '3.3.0';

				if (!semver.valid(packageVersion)) {
					packageVersion = templatesVersionMinimum;
				}

				const supportsTemplates = semver.gte(
					packageVersion,
					templatesVersionMinimum
				);
				if (supportsTemplates) {
					allDependencies.push(templateToInstall);
				} else if (template) {
					console.log('');
					console.log(
              `The ${chalk.cyan(packageInfo.name)} version you're using ${
                packageInfo.name === 'react-scripts' ? 'is not' : 'may not be'
              } compatible with the ${chalk.cyan('--template')} option.`
					);
					console.log('');
				}

				console.log(
            `Installing ${chalk.cyan('react')}, ${chalk.cyan(
            	'react-dom'
            )}, and ${chalk.cyan(packageInfo.name)}${
              supportsTemplates ? ` with ${chalk.cyan(templateInfo.name)}` : ''
            }...`
				);
				console.log();

				return install(
					root,
					useYarn,
					usePnp,
					allDependencies,
					verbose,
					isOnline
				).then(() => ({
					packageInfo,
					supportsTemplates,
					templateInfo
				}));
			})
			.then(async ({ packageInfo, supportsTemplates, templateInfo }) => {
				const packageName = packageInfo.name;
				const templateName = supportsTemplates ? templateInfo.name : undefined;
				checkNodeVersion(packageName);
				setCaretRangeForRuntimeDeps(packageName);

				const pnpPath = path.resolve(process.cwd(), '.pnp.js');

				const nodeArgs = fs.existsSync(pnpPath) ? ['--require', pnpPath] : [];

				await executeNodeScript(
					{
						cwd: process.cwd(),
						args: nodeArgs
					},
					[root, appName, verbose, originalDirectory, templateName],
            `
          const init = require('${packageName}/scripts/init.js');
          init.apply(null, JSON.parse(process.argv[1]));
        `
				);

				if (version === 'react-scripts@0.9.x') {
					console.log(
						chalk.yellow(
							'\nNote: the project was bootstrapped with an old unsupported version of tools.\n'
                  + 'Please update to Node >=14 and npm >=6 to get supported tools in new projects.\n'
						)
					);
				}
			})
			.catch(reason => {
				console.log();
				console.log('Aborting installation.');
				if (reason.command) {
					console.log(`  ${chalk.cyan(reason.command)} has failed.`);
				} else {
					console.log(
						chalk.red('Unexpected error. Please report it as a bug:')
					);
					console.log(reason);
				}
				console.log();

				const knownGeneratedFiles = ['package.json', 'node_modules'];
				const currentFiles = fs.readdirSync(path.join(root));
				currentFiles.forEach(file => {
					knownGeneratedFiles.forEach(fileToMatch => {
						if (file === fileToMatch) {
							console.log(`Deleting generated file... ${chalk.cyan(file)}`);
							fs.removeSync(path.join(root, file));
						}
					});
				});
				const remainingFiles = fs.readdirSync(path.join(root));
				if (!remainingFiles.length) {
					console.log(
              `Deleting ${chalk.cyan(`${appName}/`)} from ${chalk.cyan(
              	path.resolve(root, '..')
              )}`
					);
					process.chdir(path.resolve(root, '..'));
					fs.removeSync(path.join(root));
				}
				console.log('Done.');
				process.exit(1);
			});
	});
};

const install = (root, useYarn, usePnp, dependencies, verbose, isOnline) => {
	return new Promise((resolve, reject) => {
		let command = '';
		let args = null;
		if (useYarn) {
			command = 'yarnpkg';
			args = ['add', '--exact'];
			if (!isOnline) {
				args.push('--offline');
			}

			if (usePnp) {
				args.push('--enable-pnp');
			}
			[].push.apply(args, dependencies);
			args.push('--cwd');
			args.push(root);
			if (!isOnline) {
				console.log(chalk.yellow('You appear to be offline.'));
				console.log(chalk.yellow('Falling back to the local Yarn cache.'));
				console.log();
			}
		} else {
			command = 'npm';
			args = [
				'install',
				'--no-audit',
				'--save',
				'--save-exact',
				'--loglevel',
				'error'
			].concat(dependencies);

			if (usePnp) {
				console.log(chalk.yellow('NPM doesn\'t support PnP.'));
				console.log(chalk.yellow('Falling back to the regular installs.'));
				console.log();
			}
		}
		if (verbose) {
			args.push('--verbose');
		}
		const child = spawn(command, args, { stdio: 'inherit' });
		child.on('close', code => {
			if (code) {
				reject(new Error({
					command: `${command} ${args.join(' ')}`
				}));
				return;
			}
			resolve();
		});
	});
};

const executeNodeScript = ({ cwd, args }, data, source) => {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath,
			[...args, '-e', source, '--', JSON.stringify(data)],
			{ cwd, stdio: 'inherit' }
		);
		child.on('close', code => {
			if (code) {
				reject(new Error({
					command: `node ${args.join(' ')}`
				}));
				return;
			}
			resolve();
		});
	});
};

const setCaretRangeForRuntimeDeps = packageName => {
	const packagePath = path.join(process.cwd(), 'package.json');
	const packageJson = require(packagePath);

	if (typeof packageJson.dependencies === 'undefined') {
		console.error(chalk.red('Missing dependences in package.json'));
		process.exit(1);
	}

	makeCaretRange(packageJson.dependencies, 'react');
	makeCaretRange(packageJson.dependencies, 'react-dom');
	fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4) + os.EOL);
};

const makeCaretRange = (dependencies, name) => {
	const version = dependencies[name];
	if (typeof version === 'undefined') {
		console.error(chalk.red(`Missing ${name} dependency in package.json`));
		process.exit(1);
	}
	let patchedVersion = `^${version}`;
	if (!semver.validRange(patchedVersion)) {
		console.error(
        `Unable to patch ${name} dependency version because version ${chalk.red(
        	version
        )} will become invalid ${chalk.red(patchedVersion)}`
		);
		patchedVersion = version;
	}
	dependencies[name] = patchedVersion;
};

const checkNodeVersion = packageName => {
	const packageJsonPath = path.resolve(
		process.cwd(),
		'node_modules',
		packageName,
		'package.json'
	);
	if (!fs.existsSync(packageJsonPath)) {
		return;
	}
	const packageJson = require(packageJsonPath);
	if (!packageJson.engines || !packageJson.engines.node) {
		return;
	}
	if (!semver.satisfies(process.version, packageJson.engines.node)) {
		console.error(
			chalk.red(
				'You are running Node %s.\n'
                + 'Create React App requires Node %s or higher. \n'
                + 'Please update your version of Node.'
			),
			process.version,
			packageJson.engines.node
		);
		process.exit(1);
	}
};

const checkIfOnline = (useYarn) => {
	if (!useYarn) Promise.resolve(true);
	return new Promise(resolve => {
		dns.lookup('registry.yarnpkg.com', err => {
			let proxy = null;
			if (err != null && (proxy = getProxy())) {
				dns.lookup(URL.parse(proxy).hostname, proxyErr => {
					resolve(proxyErr);
				});
			} else {
				resolve(err === null);
			}
		});
	});
};

const getProxy = () => {
	if (process.env.https_proxy) {
		return process.env.https_proxy;
	}

	try {
		let httpsProxy = execSync('npm config get https-proxy').toString().trim();
		return httpsProxy !== 'null' ? httpsProxy : undefined;
	} catch (err) {
		console.log(err);
	}
};

const getPackageInfo = installPackage => {
	if (installPackage.match(/^.+\.(tgz|tar\.gz)$/)) {
		return getTemporaryDirectory()
			.then(obj => {
				let stream = null;
				if (/^http/.test(installPackage)) {
					stream = hyperquest(installPackage);
				} else {
					stream = fs.createReadStream(installPackage);
				}
				return extractStream(stream, obj.tmpdir).then(() => obj);
			})
			.then(obj => {
				const { name, version } = require(path.join(
					obj.tmpdir,
					'package.json'
				));
				obj.cleanup();
				return { name, version };
			})
			.catch(err => {
				console.log(
              `Could not extract the package name from the archive: ${err.message}`
				);
				const assumedProjectName = installPackage.match(
					/^.+\/(.+?)(?:-\d+.+)?\.(tgz|tar\.gz)$/
				)[1];
				console.log(
              `Based on the filename, assuming it is "${chalk.cyan(
              	assumedProjectName
              )}"`
				);
				return Promise.resolve({ name: assumedProjectName });
			});
	} else if (installPackage.startsWith('git+')) {
		return Promise.resolve({
			name: installPackage.match(/([^/]+)\.git(#.*)?$/)[1]
		});
	} else if (installPackage.match(/.+@/)) {
		return Promise.resolve({
			name: installPackage.charAt(0) + installPackage.substr(1).split('@')[0],
			version: installPackage.split('@')[1]
		});
	} else if (installPackage.match(/^file:/)) {
		const installPackagePath = installPackage.match(/^file:(.*)?$/)[1];
		const { name, version } = require(path.join(
			installPackagePath,
			'package.json'
		));
		return Promise.resolve({ name, version });
	}
	return Promise.resolve({name: installPackage});
};

const getTemporaryDirectory = () => {
	return new Promise((resolve, reject) => {
		tmp.dir({ unsafeCleanup: true }, (err, tmpdir, callback) => {
			if (err) {
				reject(err);
			} else {
				resolve({
					tmpdir: tmpdir,
					cleanup: () => {
						try {
							callback();
						} catch (ignored) {
							throw new Error(ignored);
						}
					}
				});
			}
		});
	});
};

const extractStream = (stream, dest) => {
	return new Promise((resolve, reject) => {
		stream.pipe(
			unpack(dest, err => {
				if (err) {
					reject(err);
				} else {
					resolve(dest);
				}
			})
		);
	});
};

const getInstallPackage = (version, originalDirectory) => {
	let packageToInstall = 'react-scripts';
	const validSemver = semver.valid(version);
	if (validSemver) {
		packageToInstall += `@${validSemver}`;
	} else if (version) {
		if (version[0] === '@' && !version.includes('/')) {
			packageToInstall += version;
		} else if (version.match(/^file:/)) {
			packageToInstall = `file:${path.resolve(
				originalDirectory,
				version.match(/^file:(.*)?$/)[1]
			)}`;
		} else {
			packageToInstall = version;
		}
	}

	const scriptsToWarn = [
		{
			name: 'react-scripts-ts',
			message: chalk.yellow(
          `The react-scripts-ts package is deprecated. TypeScript is now supported natively in Create React App. You can use the ${chalk.green(
          	'--template typescript'
          )} option instead when generating your app to include TypeScript support. Would you like to continue using react-scripts-ts?`
			)
		}
	];

	for (const script of scriptsToWarn) {
		if (packageToInstall.startsWith(script.name)) {
			return prompts({
				type: 'confirm',
				name: 'useScript',
				message: script.message,
				initial: false
			}).then(answer => {
				if (!answer.useScript) {
					process.exit(0);
				}

				return packageToInstall;
			});
		}
	}

	return Promise.resolve(packageToInstall);
};

const getTemplateInstallPackage = (template, originalDirectory) => {
	let templateToInstall = 'buzzs-react-template';
	if (template) {
		if (template.match(/^file:/)) {
			templateToInstall = `file:${path.resolve(
				originalDirectory,
				template.match(/^file:(.*)?$/)[1]
			)}`;
		} else if (
			template.includes('://')
        || template.match(/^.+\.(tgz|tar\.gz)$/)
		) {
			templateToInstall = template;
		} else {
			const packageMatch = template.match(/^(@[^/]+\/)?([^@]+)?(@.+)?$/);
			const scope = packageMatch[1] || '';
			const templateName = packageMatch[2] || '';
			const version = packageMatch[3] || '';

			if (
				templateName === templateToInstall
          || templateName.startsWith(`${templateToInstall}-`)
			) {
				templateToInstall = `${scope}${templateName}${version}`;
			} else if (version && !scope && !templateName) {
				templateToInstall = `${version}/${templateToInstall}`;
			} else {
				templateToInstall = `${scope}${templateToInstall}-${templateName}${version}`;
			}
		}
	}

	return Promise.resolve(templateToInstall);
};

const checkYarnVersion = () => {
	const minYarnPnp = '1.12.0';
	const maxYarnPnp = '2.0.0';
	let hasMinYarnPnp = false;
	let hasMaxYarnPnp = false;
	let yarnVersion = null;
	try {
		yarnVersion = execSync('yarnpkg --version').toString().trim();
		if (semver.valid(yarnVersion)) {
			hasMinYarnPnp = semver.gte(yarnVersion, minYarnPnp);
			hasMaxYarnPnp = semver.lt(yarnVersion, maxYarnPnp);
		} else {
			const trimmedYarnVersionMatch = /^(.+?)[-+].+$/.exec(yarnVersion);
			if (trimmedYarnVersionMatch) {
				const trimmedYarnVersion = trimmedYarnVersionMatch.pop();
				hasMinYarnPnp = semver.gte(trimmedYarnVersion, minYarnPnp);
				hasMaxYarnPnp = semver.lt(trimmedYarnVersion, maxYarnPnp);
			}
		}
	} catch (err) {
		console.log(err);
	}
	return {
		hasMinYarnPnp: hasMinYarnPnp,
		hasMaxYarnPnp: hasMaxYarnPnp,
		yarnVersion: yarnVersion
	};
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
	init,
	getTemplateInstallPackage
};
