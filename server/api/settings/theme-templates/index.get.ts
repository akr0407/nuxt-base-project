import prisma from '~/server/utils/prisma'
import { getTenantId } from '~/server/utils/tenant'

export default defineEventHandler(async (event) => {
    const tenantId = getTenantId(event)

    // Get global templates and tenant-specific templates
    const templates = await prisma.themeTemplate.findMany({
        where: {
            OR: [
                { isGlobal: true },
                ...(tenantId ? [{ tenantId }] : []),
            ],
        },
        orderBy: [
            { isGlobal: 'desc' },
            { createdAt: 'desc' },
        ],
    })

    return { success: true, data: templates }
})
