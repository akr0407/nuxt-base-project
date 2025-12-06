import prisma from '../../utils/prisma'
import { requireAuth, requirePermission } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'users:read')

    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'User ID is required',
        })
    }

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            userRoles: {
                include: {
                    role: {
                        select: { id: true, name: true },
                    },
                },
            },
        },
    })

    if (!user) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
            message: 'User not found',
        })
    }

    return {
        success: true,
        data: {
            ...user,
            roles: user.userRoles.map((ur) => ur.role),
            userRoles: undefined,
        },
    }
})
