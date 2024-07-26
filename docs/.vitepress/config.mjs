import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Buzzs-Cli",
    description: "A Buzzs-Cli websit!",
    themeConfig: {
        search: {
            provider: 'local'
        },
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Examples', link: '/markdown-examples' }
        ],

        sidebar: [
            {
                items: [
                    { text: 'Runtime API Examples', link: '/api-examples' },
                    { text: 'Markdown Examples', link: '/markdown-examples' },
                ]
            }
        ],

        socialLinks: [
        { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
        ]
    }
})
