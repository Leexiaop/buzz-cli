# createApp创建应用

经过了初始化的一些列检查后，我们也要进入到创建应用的阶段，那么我们在这里都要做些什么呢？
+ 首先要检查一下，要创建的文件夹是不是存在， 如果存在我们就是提示，或者结束进程
+ 设置react-script的版本
+ 写入package.json文件
+ 检查yarn,pnp等依赖安装工具的版本，准备依赖安装

所以要先确定一下参数：

name, verbose, version, template, useYarn, usePnp

这应该是creatApp这个函数的主要功能，接下来，我们就来完成这个函数：
```js
const createApp = () => {}
```