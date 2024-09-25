# isSafeToCreateProjectIn

这里主要的任务是判断，我们创建的目录下是不是干净的文件夹，所谓干净的文件夹并不是一个完全空的文件夹，而是指这里不要有干扰的文件，比如‘.git’等类似文件。这里也不多讲，本函数是从create-react-app源码中抄过来的：

```js
const fs=require('fs-extra')
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
```