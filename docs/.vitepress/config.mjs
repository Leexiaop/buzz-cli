import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: 'Create-Buzzs-App',
	description: 'A Create-Buzzs-app description!',
	base: process.env.NODE_ENV === 'development' ? '/' : '/create-buzzs-app/',
	themeConfig: {
		search: {
			provider: 'local'
		},
		nav: [
			{ text: 'Buzzs', link: 'https://www.ibadgers.cn/buzzs/' },
			{ text: 'Buzzs-UI', link: 'https://www.ibadgers.cn/buzzs-ui/' }
		],

		sidebar: [
			{
				text: '欢迎',
				items: [{ text: '关于文档', link: '/about' }]
			},
			{
				text: '文档',
				items: [{ text: '开始', link: '/start' }]
			},
			{
				text: '开发',
				items: [
					{
						text: '准备工作',
						link: '/before'
					},
					{
						text: '初始化项目',
						link: '/init'
					},
					{
						text: 'create-buzzs-app',
						link: '/create-buzzs-app/index',
						items: [
							{
								text: 'index.js',
								link: '/create-buzzs-app/indexjs'
							},
							{
								text: 'init函数',
								link: '/create-buzzs-app/init'
							}
						]
					}
				]
			}
		],

		socialLinks: [{ icon: 'github', link: 'https://github.com/Leexiaop/buzz-cli' }]
	}
});
