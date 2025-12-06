import prisma from '../../utils/prisma'
import { requireAuth, requirePermission } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'roles:read')

    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Role ID is required',
        })
    }

    const role = await prisma.role.findUnique({
        where: { id },
        include: {
            rolePermissions: {
                include: {
                    permission: {
                        select: { id: true, name: true, description: true },
                    },
                },
            },
            _count: {
                select: { userRoles: true },
            },
        },
    })

    if (!role) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
            message: 'Role not found',
        })
    }

    return {
        success: true,
        data: {
            id: role.id,
            name: role.name,
            description: role.description,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
            permissions: role.rolePermissions.map((rp) => rp.permission),
            userCount: role._count.userRoles,
        },
    }
})
