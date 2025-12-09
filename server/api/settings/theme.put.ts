import { themeSettingsSchema } from '~/server/utils/theme'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'settings:update')

    const body = await validateBody(event, themeSettingsSchema)

    const settings = await prisma.settings.upsert({
        where: { key: 'theme' },
        update: { value: body },
        create: {
            id: 'theme_settings',
            key: 'theme',
            value: body
        },
    })

    return { success: true, data: settings.value }
})
