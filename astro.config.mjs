import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'

export default defineConfig({
	integrations: [
		UnoCSS({
			injectReset: true // or a path to the reset file
		}),
	],
	markdown: {
		shikiConfig: {
			themes: {
				light: 'catppuccin-latte',
				dark: 'catppuccin-mocha',
			},
		},
	},
})
