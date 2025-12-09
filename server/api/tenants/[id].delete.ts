import prisma from '~/server/utils/prisma'
import { isSuperAdmin } from '~/server/utils/tenant'

export default defineEventHandler(async (event) => {
    await requireAuth(event)

    if (!isSuperAdmin(event)) {
        throw createError({ statusCode: 403, message: 'SuperAdmin access required' })
    }

    await requirePermission(event, 'tenants:delete')

    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'Tenant ID is required' })
    }

    // Check tenant exists
    const tenant = await prisma.tenant.findUnique({ where: { id } })
    if (!tenant) {
        throw createError({ statusCode: 404, message: 'Tenant not found' })
    }

    // Prevent deleting the default tenant
    if (tenant.slug === 'default') {
        throw createError({ statusCode: 400, message: 'Cannot delete the default tenant' })
    }

    // Delete will cascade to users, settings, etc.
    await prisma.tenant.delete({ where: { id } })

    return { success: true, message: 'Tenant deleted successfully' }
})
