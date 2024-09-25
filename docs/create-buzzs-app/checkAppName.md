# 检查appName的合法性

我们这里appname的合法性借助npm包的规则，所以要借助包validate-npm-package-name来校验appname的合法性，如果是不合法，那么直接提示信息，结束进程即可。其次就是我们要校验appname不能是保留字符，比如说，react,react-dom，vue,angular这类的，如果是，那么我们也直接结束进程，提示信息。所以整体函数应该这样写：

```js
const validateProjectName = require('validate-npm-package-name');
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
```