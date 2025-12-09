import prisma from '~/server/utils/prisma'
import { isSuperAdmin } from '~/server/utils/tenant'

export default defineEventHandler(async (event) => {
    await requireAuth(event)

    if (!isSuperAdmin(event)) {
        throw createError({ statusCode: 403, message: 'SuperAdmin access required' })
    }

    await requirePermission(event, 'tenants:read')

    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'Tenant ID is required' })
    }

    const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
            _count: {
                select: { users: true, roles: true, settings: true },
            },
        },
    })

    if (!tenant) {
        throw createError({ statusCode: 404, message: 'Tenant not found' })
    }

    return {
        success: true,
        data: {
            ...tenant,
            userCount: tenant._count.users,
            roleCount: tenant._count.roles,
            _count: undefined,
        },
    }
})
