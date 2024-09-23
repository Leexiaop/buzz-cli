# 判断是否可以使用yarn

node中检查是否可以是使用yarn来安装包，其实非常简单，我们可以这样做：
```js
const isUsingYarn = () => {
	return (process.env.npm_config_user_agent || '').indexOf('yarn') === 0;
};
```

我们通过全局变量process.env上是否存在属性npm_config_user_agent，来判断是否可以使用yarn。