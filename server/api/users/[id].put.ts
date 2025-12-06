import prisma from '../../utils/prisma'
import { requireAuth, requirePermission, validateBody } from '../../utils/auth'
import { updateUserSchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'users:update')

    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'User ID is required',
        })
    }

    const body = await validateBody(event, updateUserSchema)

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

    // Check email uniqueness if updating email
    if (body.email && body.email !== existingUser.email) {
        const emailTaken = await prisma.user.findUnique({
            where: { email: body.email },
        })
        if (emailTaken) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Conflict',
                message: 'Email is already in use',
            })
        }
    }

    // Update user and roles
    const user = await prisma.$transaction(async (tx) => {
        // Update user fields
        const updated = await tx.user.update({
            where: { id },
            data: {
                email: body.email,
                name: body.name,
                isActive: body.isActive,
            },
            select: {
                id: true,
                email: true,
                name: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        // Update roles if provided
        if (body.roleIds !== undefined) {
            // Delete existing roles
            await tx.userRole.deleteMany({
                where: { userId: id },
            })

            // Add new roles
            if (body.roleIds.length > 0) {
                await tx.userRole.createMany({
                    data: body.roleIds.map((roleId) => ({
                        userId: id,
                        roleId,
                    })),
                })
            }
        }

        return updated
    })

    // Fetch updated user with roles
    const userWithRoles = await prisma.user.findUnique({
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

    return {
        success: true,
        data: {
            ...userWithRoles,
            roles: userWithRoles?.userRoles.map((ur) => ur.role),
            userRoles: undefined,
        },
    }
})
