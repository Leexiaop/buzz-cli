import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Buzzs-Cli",
	description: "A Buzzs-Cli websit!",
	themeConfig: {
		search: {
			provider: "local",
		},
		nav: [
			{ text: "Buzzs", link: "https://www.ibadgers.cn/buzzs/" },
			{ text: "Buzzs-UI", link: "https://www.ibadgers.cn/buzzs-ui/" },
			{ text: "Github", link: "/markdown-examples" },
		],

		sidebar: [
			{
				text: "欢迎",
				items: [{ text: "关于文档", link: "/about" }],
			},
			{
				text: "入门",
				items: [{ text: "开始", link: "/start" }],
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/vuejs/vitepress" },
		],
	},
});
