import prisma from '~/server/utils/prisma'
import { getTenantId, isSuperAdmin } from '~/server/utils/tenant'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'settings:update')

    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'Template ID is required' })
    }

    // Find the template
    const template = await prisma.themeTemplate.findUnique({
        where: { id },
    })

    if (!template) {
        throw createError({ statusCode: 404, message: 'Template not found' })
    }

    // Check permissions
    const tenantId = getTenantId(event)
    const userIsSuperAdmin = isSuperAdmin(event)

    // SuperAdmins can delete any template
    // Tenant users can only delete their own tenant's templates (not global ones)
    if (!userIsSuperAdmin) {
        if (template.isGlobal) {
            throw createError({ statusCode: 403, message: 'Cannot delete global templates' })
        }
        if (template.tenantId !== tenantId) {
            throw createError({ statusCode: 403, message: 'Cannot delete templates from other tenants' })
        }
    }

    await prisma.themeTemplate.delete({
        where: { id },
    })

    return { success: true, message: 'Template deleted' }
})
