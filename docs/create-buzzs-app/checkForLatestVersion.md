# 获取远程版本号

我们知道，npm上的版本是依次递增的，也就是说，你每一次所发的包的版本必须要大于上一次在npm上发布的包的版本，所以，这里我们就获取一下npm上最新的版本是多少，我们通过node的http包的get请求直接获取即可，这里我们封装返回一个promise的函数checkForLatestVersion：

```js
const http = require("http")
const checkForLatestVersion = () => {
   return new Promise((resolve, reject) => {
		https
			.get(
				'https://registry.npmjs.org/-/package/create-buzzs-app/dist-tags',
				(res) => {
					if (res.statusCode === 200) {
						let body = '';
						res.on('data', (data) => (body += data));
						res.on('end', () => {
							resolve(JSON.parse(body).latest);
						});
					} else {
						reject(new Error('出错了'));
					}
				}
			)
			.on('error', () => reject(new Error('出错了')));
	});
}
```
注意这里的请求http包是node中的http，这里使用了res.on()的方法，更多关于http的内容请查看https://www.nodeapp.cn/http.html