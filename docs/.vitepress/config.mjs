import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Buzzs-cli",
	description: "A Buzzs-Cli websit!",
	base: '/buzzs-cli/',
	themeConfig: {
		search: {
			provider: "local",
		},
		nav: [
			{ text: "Buzzs", link: "https://www.ibadgers.cn/buzzs/" },
			{ text: "Buzzs-UI", link: "https://www.ibadgers.cn/buzzs-ui/" },
		],

		sidebar: [
			{
				text: "欢迎",
				items: [{ text: "关于文档", link: "/about" }],
			},
			{
				text: "文档",
				items: [{ text: "开始", link: "/start" }],
			},
			{
				text: "开发",
				items: [
					{text: '准备工作', link: '/before'},
					{text: '初始化项目', link: '/init'}
				]
			}
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/Leexiaop/buzz-cli" },
		],
	},
});
