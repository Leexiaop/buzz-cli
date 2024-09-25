# createApp创建应用

经过了初始化的一些列检查后，我们也要进入到创建应用的阶段，那么我们在这里都要做些什么呢？
+ 检查node版本是不是在14之上，并且在不满足条件下指定script的版本
+ 要检查一下，要创建的文件夹是不是存在， 如果存在我们就是提示，或者结束进程
+ 检查创建的文件夹是不是空文件夹，里面有没有不合法的内容存在
+ 设置react-script的版本
+ 写入package.json文件
+ 检查yarn,pnp等依赖安装工具的版本，准备依赖安装

所以要先确定一下参数：

name: 创建应用的名称；
verbose：本函数中用不到的参数，只是透传；
version：script的版本；
template：模版，这里就是指的是buzzs-react-template,或者是未来的ts，vue等等的模版；
useYarn：可不可以使用yarn安装依赖；
usePnp：可不可以使用pnp安装依赖

这应该是creatApp这个函数的主要功能，接下来，我们就来完成这个函数：

## 检查node版本，并指定不满足条件的script版本

这里我们通过semver的coerce方法来获取到node的版本为：
```js
console.log(semver.coerce(process.version))
SemVer {
  options: {},
  loose: false,
  includePrerelease: false,
  raw: '18.18.0',
  major: 18,
  minor: 18,
  patch: 0,
  prerelease: [],
  build: [],
  version: '18.18.0'
}
```
然后就是通过semver.satisfies()方法来拍判断获取到的node版本是不是大于等于14，这里的semver.satisfies()是判断是否在某个区间。
```js
const semver = require("semver")
const createApp = (name, verbose, version, template, useYarn, usePnp) => {
    const unsportedNodeVersion = !semver.satisfies(semver.coerce(process.version), '>=14');
	if (unsportedNodeVersion) {
		console.log(chalk.yellow(`You are useing Node ${process.version} so the project will be bootstrapped with an old unsupported version of tools.\n\n Please update to Node 14 or higher for a better, fully supported experience.\n`));
		version = 'react-scripts@0.9.x';
	}
}
```
当node版本不大于14的时候，我们指定script的版本即可。

更多关于semver内容，请查看https://classic.yarnpkg.com/en/package/semver

# 检查应用的名称

我们这里首先要检查传入的名称是否合法，因为我们对这个有一定的要求和限制，比如我们不能创建一个同名的应用，比如创建的应用名称不能使用敏感或者保留字符，如react等，对吧，所以，这是我们的目的，所以应该这样写：
首先我们要获取一下绝对路径，知道我们将在哪里创建应用。
```js
const path = require('path')
...
const root = path.resolve(name) //  这里是获取到的绝对路径
const appname = path.basename(root) //  这里其实就是name
checkAppName(appname)
...
```
关于checkAppName函数，请移不动checkAppName方法中。

## 检查创建好的项目文件目录下有没有不合法的东西

当我们创建好项目文件后，我们还要检查期下面是不是有不合法的东西存在，比如是不是有package.json存在等：
```js
const fs =  require('fs')

fs.ensureDirSync(name)
if (!isSafeToCreateProjectIn(root, name)) {
	process.exit(1);
}

```
更多关于isSafeToCreateProjectIn请移步到isSafeToCreateProjectIn函数。

接下来，我们首先写入package.json文件：
```js
const package = {
    name: appName,
    version: '0.0.1',
    private: true
}
fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 4) + os.EOL);
```
当我们写入package.json后，我们就开始考虑依赖安装的问题，。所以接下来就是检查npm,yarn, pnpm这些包管理器，是否支持

## 检查包管理器的版本
这里我们要先变更进程到当前目录下再做检查，目的就是为了准确，然后再通过yarn,pnpm,npm等来确定当前version版本。
```js
    const originalDirectory = process.cwd();
	//  变更node工作的进程目录
	process.chdir(root);
	//  检查系统配置检查
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
```
相关函数，可以关注具体函数体内容。

关于process内容关注：https://www.nodeapp.cn/process.html#process_process_chdir_directory

当所有检查都完成后，我们也就将要进入到依赖包安装阶段了。。。

## run方法的调用

```js
run(
    root,   //  所在根路径
    appName,
    version,
    verbose,
    originalDirectory,  //  当前文件夹
    template,
    useYarn,
    usePnp
);
```

# 完整createApp代码

```js
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
	fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 4) + os.EOL);

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
```