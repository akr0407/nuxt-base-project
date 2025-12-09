import { themeSettingsSchema, defaultThemeSettings } from '~/server/utils/theme'

export default defineEventHandler(async () => {
    const settings = await prisma.settings.findUnique({
        where: { key: 'theme' },
    })

    if (!settings) {
        return { success: true, data: defaultThemeSettings }
    }

    return { success: true, data: settings.value }
})
