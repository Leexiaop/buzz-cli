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
								text: 'init',
								link: '/create-buzzs-app/init'
							},
							{
								text: 'checkForLatestVersion',
								link: '/create-buzzs-app/checkForLatestVersion'
							},
							{
								text: 'createApp',
								link: '/create-buzzs-app/createApp'
							},
							{
								text: 'isUsingYarn',
								link: '/create-buzzs-app/isUsingYarn'
							},
							{
								text: 'checkAppName',
								link: '/create-buzzs-app/checkAppName'
							},
							{
								text: 'checkNpmVersion',
								link: '/create-buzzs-app/checkNpmVersion'
							},
							{
								text: 'checkYarnVersion',
								link: '/create-buzzs-app/checkYarnVersion'
							},
							{
								text: 'checkThatNpmCanReadCwd',
								link: '/create-buzzs-app/checkThatNpmCanReadCwd'
							},
							{
								text: 'isSafeToCreateProjectIn',
								link: '/create-buzzs-app/isSafeToCreateProjectIn'
							},
							{
								text: 'run',
								link: '/create-buzzs-app/run'
							},
							{
								text: 'getInstallPackage',
								link: '/create-buzzs-app/getInstallPackage'
							},
							{
								text: 'getTemplateInstallPackage',
								link: '/create-buzzs-app/getTemplateInstallPackage'
							},
							{
								text: 'getPackageInfo',
								link: '/create-buzzs-app/getPackageInfo'
							}
						]
					},
					{
						text: 'buzzs-react-template',
						link: '/buzzs-react-template/index'
					},
					{
						text: 'buzzs-script',
						link: '/buzzs-script/index'
					}
				]
			}
		],

		socialLinks: [{ icon: 'github', link: 'https://github.com/Leexiaop/buzz-cli' }]
	}
});
