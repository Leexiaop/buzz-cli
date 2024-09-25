# 检查npm的版本

检查npm的版本，怎么看？只要在命令行运行命令npm --version是不是就能知道当前环境安装的npm版本是多少了，对吧？对，就是这么简单，所以，我们要借助node中child_process.execSync()方法，来运行这个命令，即可得到npm版本。但是这里我们还要求一个最低的版本，要求npm大于6，再加上错误处理即可。所以，checkNpmVersion的方法应该这样写：

```js
const semver = require('semver');
const execSync = require('child_process').execSync;

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
```

这里的semver.gte()就是为了判断当前的版本是不是高于最小版本。