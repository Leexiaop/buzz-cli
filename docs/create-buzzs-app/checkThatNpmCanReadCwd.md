# 检查当前目录下能否读到npm

完成这个函数，那么首先我们要读取到当前目录对吧，所以，我们可以通过process.cwd()这个方法来读取当前的目录。检查当前目录能不能读取到，那么在当前目录下能读取到npm的配置信息，是不是就可以了，所以我们要在当前目录下运行```npm config list```来获取信息，即可，因为，每个人用的系统不一样，有macOS，windows，或者linux，所以这里我们使用一个夸平台的进程命令包```cross-spawn```来执行npm config list命令。（更多关于cross-spawn请关注https://classic.yarnpkg.com/en/package/cross-spawn）
执行完该命令后的结果应该是：
```
    ; "user" config from C:\Users\PC\.npmrc

    //registry.npmjs.org/:_authToken = (protected)
    registry = "https://registry.npmjs.org"
    strict-ssl = false

    ; node bin location = C:\Program Files\nodejs\node.exe
    ; node version = v18.18.0
    ; npm local prefix = D:\work\buzz-cli
    ; npm version = 9.8.1
    ; cwd = D:\work\buzz-cli\docs\create-buzzs-app
    ; HOME = C:\Users\PC
    ; Run `npm config ls -l` to show all defaults.

```
当拿到相关信息后，我们找到和process.cwd()一样的信息，即可认为是我们能读取到npm的信息。否则返回false.
所以代码应该是这样的：
```js
const spawn = require('spawn')
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
```