import { themeSettingsSchema, defaultThemeSettings } from '~/server/utils/theme'
import prisma from '~/server/utils/prisma'
import { getTenantId } from '~/server/utils/tenant'

export default defineEventHandler(async (event) => {
    const tenantId = getTenantId(event)

    // If no tenant context (e.g., not logged in), return defaults
    if (!tenantId) {
        return { success: true, data: defaultThemeSettings }
    }

    const settings = await prisma.settings.findUnique({
        where: { tenantId_key: { tenantId, key: 'theme' } },
    })

    if (!settings) {
        return { success: true, data: defaultThemeSettings }
    }

    return { success: true, data: settings.value }
})
