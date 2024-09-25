# 检查yarn的版本

yarn的版本检查和npm的版本检查如出一辙，这里我们不做过多的解释，思路完全和检查npm的思路一样，只是这里我们有一个最小版本和最大版本的概念。

```js
const semver = require('semver')

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
```