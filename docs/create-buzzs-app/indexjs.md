# 当前环境下node版本检查

## 思路
我们知道前端创建项目，严重依赖你机器上的node环境，所以，作为脚手架，我们要对node版本做一个限制，如果create-react-app脚手架一样，我们要求所用机器的node版本不能低于14，否则就不能通过该脚手架创建项目，所以，在入口文件中，将这个事儿作为一切一切的大前提，```检查node版本，检查node版本，检查node版本```，重要的事情说三遍：
```js
const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];

//  检查node版本
if (major < 14) {
	console.error(
		`Your node version is ${major},
        Create Buzzs App requires Node 14 or heigher, please update your version of Node.`
	);
	process.exist(1);
}
```
当发现node版本低于14后，我们要提示错误新，将信息输出到控制台，然后退出进程。

------------------------------------------------------------------------
[`注`]:
>+ process 对象是一个全局变量，它提供当前 Node.js 进程的有关信息，以及控制当前 Node.js 进程。 因为是全局变量，所以无需使用 require()。process.versions属性返回一个对象，此对象列出了Node.js和其依赖的版本信息。 process.versions.modules表明了当前ABI版本，此版本会随着一个C++API变化而增加。 Node.js会拒绝加载模块，如果这些模块使用一个不同ABI版本的模块进行编译。所以，我们通过其versions对象来获取node的具体信息：
```js
console.log(process.versions)
// {
//     http_parser: '2.7.0',
//     node: '8.9.0',
//     v8: '6.3.292.48-node.6',
//     uv: '1.18.0',
//     zlib: '1.2.11',
//     ares: '1.13.0',
//     modules: '60',
//     nghttp2: '1.29.0',
//     napi: '2',
//     openssl: '1.0.2n',
//     icu: '60.1',
//     unicode: '10.0',
//     cldr: '32.0',
//     tz: '2016b'
// }
```
所以，这样我们就可以判断node版本符不符合我们的要求，如果不符合，直接通过process.exit(1)来退出进程。process.exit([code])参数code为可选参数，如果不传则默认为0意思为success,要不使用process.exitCode属性值，前提是此属性已被设置。 Node.js在所有'exit'事件监听器都被调用了以后，才会终止进程。而现在我们传入的值为1，则表示failure.

更多关于process的方法和属性可以查看https://www.nodeapp.cn/process.html；

-----------------------------------------------------

## 完整代码
当检查过使用的环境node版本大于14后，说明当前的环境是没有问题的，那就可以进入到下一步的创建，而真正的创建程序也是从create-buzzs-app文件夹的init函数开始的，所以，这里我们就引入这个方法并且调用即可。这里完整的代码是：
```js
const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];

//  检查node版本
if (major < 14) {
	console.error(
		`Your node version is ${major}, Create Buzzs App requires Node 14 or heigher, please update your version of Node.`
	);
	process.exist(1);
}

const { init } = require('./create-buzzs-app');
init();
```