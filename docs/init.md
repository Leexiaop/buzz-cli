# 初始化项目

## 初始化工作区

```shell
mkdir buzz-cli && npm init
```
这样你会在buzzs-cli目录下看到一个package.json文件。表示我们已经初始化项目成功。

## 安装lerna

```shell
npm install -g lerna
```
这样我们就在项目的根目录下会看到lerna.json,证明lerna已经安装成功。在新版本的lerna不会帮我们创建工作区，所以需要我们自己手动创建目录packages作为工作区。那么此时的目录结构应该是：

```
my-project
    node_modules/
    package.json
    lerna.json
    packages/
```

接下来，我们就会在packages中创建我们要开发的包。

同过命令创建包：

```shell
lerna create xxxx
```
会在packages目录下创建一个包。

## 安装依赖

在整个项目中，有私有依赖和公共依赖之分，私有依赖，就是在packages下具体到只有某个包自己会有用到的依赖。而公共依赖，就是某一个依赖，会被多个包所使用。这也是lerna管理包的一个特点。

+ 安装私有包
```shell
lerna add moduleB --scope=moduleA
```
意思是在moduleA模块下安装moduleB依赖

当然也可以通过yarn来安装：
```shell
yarn workspace moduleA add moduleB
```
这里的意思相对于就更加明确。

+ 安装共有包

```shell
lerna add module
```
安装共有包相对更简单，直接安装即可

或者使用yarn来安装：

```shell
yarn add module --ignore-workspace-root-check
```
安装module依赖，后面跟一个参数，意思是忽略工作区跟目录的检查。

## 安装eslint

写代码没有规矩，是一件非常让人痛苦的事情。所以我们去安装一下eslint。这里安装将会非常简单，不要再去网上搜索什么教程，安装官网步骤安装即可：https://zh-hans.eslint.org/docs/latest/use/getting-started

```shell
npm init @eslint/config
```
然后在项目的根目录添加配置文件eslint.config.mjs，添加自己相应的规则即可。

## 添加文档

要整就是全套的，代码写完了，不能没有稳当，所以，我们依旧选择vitepress来做我们的文档生成栈。https://vitepress.dev/zh/
先安装vitepress:
```shell
npm add -D vitepress
```
然后再初始化：
```shell
npx vitepress init
```
即可。

## 部署文档

部署文档和前端项目的部署一样，通过命令···npm run docs:bulid···在docs/.vitepress/目录下生成了dist文件，就是我们的部署文件，如果您的部署不是在根目录，那么需要再docs/.vitepress/config.mjs配置baseurl即可。


## 发布npm包

+ 首先要注册npm账号。
+ 然后通过lerna publish发布即可。
