import presetWind4 from '@unocss/preset-wind4'
import {
    defineConfig,
    presetAttributify,
    presetTypography,
    presetUno,
    extractorSplit
} from 'unocss'

export default defineConfig({
    presets: [
            presetWind4({
            dark: {
                dark: '.mdui-theme-dark', // 自定义暗黑选择器
                light: '.mdui-theme-light' // 可选：自定义明亮模式选择器
            },

        }),

        presetAttributify(), // required when using attributify mode
        presetUno(), // required
        presetTypography(),
    ],
    blocklist:[
        '[rounded=""]',
    ]
})


