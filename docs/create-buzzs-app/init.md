# 初始化函数

## 前置配置

### 启动命令配置
上一篇我们检查了node版本，那么我们看到create-react-app是不是通过命令来创建项目啊。所以我们也一样，我们知道了index.js是入口文件，所以我们就要通过命令来创建项目，所以，我们要在create-buzzs-app的根目录下的package.json中配置命令：
```json
...
scripts: {
    "create": "node ./package/create-buzzs-app/lib/index"
}
...
```

这样我们就可以通过npm run create来运行创建命令了。
### 预备包安装
+ chalk包(粉笔)
    安装的命令如下：
    ```shell
    npm install chalk --save
    //  或者
    lerna add chalk --scope=create-buzzs-app
    //  或者
    yarn workspace create-buzzs-app add chalk
    ```
    chalk包的主要作用就是我们用来美化控制台输出信息的，我们经常在某些包运行完后，会看到控制台有不同颜色的文字，图案等，就是这个包的作用。
    关于等多chalk包的用法，请查看:https://classic.yarnpkg.com/en/package/chalk

## commander命令

我们想要使用命令来创建项目，那么我就需要能接收到控制台运行的命令，所以，我们这里用到了commander包，因为这是一个私有包，未来也不会在其他的包里用到，所以我们暂且在create-buzzs-app包下安装commander包。
```shell
npm install commander --save
//  或者
lerna add commadner --scope=create-buzzs-app
//  或者
yarn workspace create-buzzs-app add commander
```

安装完成后，就可以在包下的package.json中看到依赖项。那么我们在init函数中就可以使用commander包。首先要引入它。通过new commander.Command()来创建一个commond实例，注意，不同版本的commander包的不同，请以官网为准，其中我们要传入一个name属性，这个name就是未来当我们发布的npm包的创建命令，所以这里我们使用create-buzzs-app的package.json中的name

同样version也是package.json中的version。这里就是要标识当前create-buzzs-app的版本号是多少；

当我们创建一个项目的时候，我们是不是要首先创建一个文件夹，意思就是说，这个项目要放到哪个文件夹里，对吧。所以。命令后面跟的参数就是你要创建的文件夹名称，这里用arguments参数来标识。arguments的意思就是说，你在运行命令后面要跟的参数是什么。这里应该就是文件名和其他参数。

这个通过usage方法高速你创建的文件夹名称应该是什么样子的。相当于是一个例子吧，在文件夹后面你也可以传递其他参数。

options就是要传递的一些其他的参数，这里我们相当于是只给出了一个参数，verbose.后面可能会用到。

action，顾名思义，就是动作，就是说你前面的一些列动作，那么在他的回调里，我们就可以拿到通过运行命令来传递过来的参数了，这里我们主要是需要一个文件夹的名称。当拿到后，并且作为一个顶层变量，赋值给projectName.供其他函数使用。

最后就是通过parse方法来解析参数，这一步非常重要，缺少，将会不能运行程序，执行完commander命令后。没有任何的效果。也拿不到参数。

代码如下：

```js
const commander = require('commander')
const packageJson = require('../package.json')

let projectName = '';

const init = () => {
    const program = new commander.Command(packageJson.name)
		.version(packageJson.version)
		.arguments('<project-directory>')
		.usage(`${chalk.green('<project-directory>')} [options]`)
        .option('--verbose', 'print additional logs')
		.action((name) => {
			projectName = name;
		})
		.parse(process.argv);
    ...
}
```

对于commander的其他用法，可以关注一下文档：https://classic.yarnpkg.com/en/package/commander

## envinfo包

在命令运行完成后，我们可以将系统环境的一些信息打印出来，供开发者阅读：

这里需要先安装一下envinfo包：

```shell
npm install envinfo --save
//  或者
lerna add envinfo --scope=create-buzzs-app
//  或者
yarn workspace create-buzzs-app add envinfo
```

在判断program.info存在的情况下，调用envinfo的run方法将系统环境信息返回，该方法返回一个Promise对象。
```js
    ...
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
    ...
```

更多关于envinfo包信息，请查看：https://classic.yarnpkg.com/en/package/envinfo

## 检查文件名的合法性
当我们获取到文件名projectName后，我们有必要去检查一下他的合法性，不能是一个随意的名字，对吧，所以，我们这里需要检查的是他是不是一个字符串，如果不是的话，就你直接结束进程。同时，如果不满足的话，我也应该在控制台打印出错误信息，而且这里我们建议是中划线的命名。

```js
    ...
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
    ...
```

## semver包

这里我们将会用到一个node工具函数包semver.安装如下：

```shell
npm install semver --save
//  或者
lerna add semver --scope=create-buzzs-app
//  或者
yarn workspace create-buzzs-app add semver
```
我们将会用到semver.lt()这个方法，主要用来对比版本号，那么我们在我们的代码中怎么用呢？

未来我们的脚手架开发完成发布到npm上后，我们的版本号只能是增加，不能是不变或者减小对吧，对，就是这里会用到，这里我们在检查完projectName后，就要去对比远程npm上的版本和当前版本到底是那个大？代码应该是这样的：
```js
...
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
```

checkForLatestVersion方法的主要作用就是获取了远程的npm最新版本号，至于怎么获取，我们稍后再说，他返回一个promise，其结果就是返回了远程npm的版本号，我们通过对比与当前的，如果当前版本号高于远程版本号，那就继续走创建项目的createApp函数，否则，提示信息，结束进程。

```js
semver.lt(packageJson.version, res)

semver.lt('1.2.3', '2.3.4') //  true
```
这里是对比的代码。
至此，初始化函数的代码大致就是这样。

## 完整代码

```js
const packageJson = require('../package.json')
const envinfo = require('envinfo')
const semver = require('semver')
const commander = require('commander')
const chalk = require('chalk')

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
```