#  lerna创建create-buzzs-app包

当我们创建好了项目后，我们就可以通过lerna命令创建一个包，在项目根目录下运行下列命令：
```shell
lerna create create-buzzs-app
```
通过这个命令在package下创建了一个create-buzzs-app的包，其结构目录是这样的：
```
...
create-buzzs-app
    _tests_/
    package.json
    lib/
        index.js
        create-buzzs-app.js
    README.md
...
```
所以接下来，index.js和create-buzzs-app.js就是我们要开发的第一个包。也是整个项目的入口包文件，而index.js是本包的入口文件,主要目的是为了实现当前环境下node版本检测这个首要目标。