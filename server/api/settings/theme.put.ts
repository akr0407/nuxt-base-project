import { themeSettingsSchema } from '~/server/utils/theme'
import prisma from '~/server/utils/prisma'
import { requireTenantId } from '~/server/utils/tenant'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'settings:update')

    const tenantId = requireTenantId(event)
    const body = await validateBody(event, themeSettingsSchema)

    const settings = await prisma.settings.upsert({
        where: { tenantId_key: { tenantId, key: 'theme' } },
        update: { value: body },
        create: {
            key: 'theme',
            value: body,
            tenantId,
        },
    })

    return { success: true, data: settings.value }
})
