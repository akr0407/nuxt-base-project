import prisma from '../../utils/prisma'
import { requireAuth, requirePermission } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'users:delete')

    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'User ID is required',
        })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { id },
    })

    if (!existingUser) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
            message: 'User not found',
        })
    }

    // Prevent deleting the last admin
    const adminRole = await prisma.role.findUnique({
        where: { name: 'admin' },
    })

    if (adminRole) {
        const isAdmin = await prisma.userRole.findFirst({
            where: { userId: id, roleId: adminRole.id },
        })

        if (isAdmin) {
            const adminCount = await prisma.userRole.count({
                where: { roleId: adminRole.id },
            })

            if (adminCount <= 1) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Bad Request',
                    message: 'Cannot delete the last admin user',
                })
            }
        }
    }

    // Delete user (cascades to user_roles and refresh_tokens)
    await prisma.user.delete({
        where: { id },
    })

    return {
        success: true,
        message: 'User deleted successfully',
    }
})
