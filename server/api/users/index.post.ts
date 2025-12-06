import prisma from '../../utils/prisma'
import { requireAuth, requirePermission, validateBody } from '../../utils/auth'
import { createUserSchema } from '../../utils/schemas'
import { hashPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'users:create')

    const body = await validateBody(event, createUserSchema)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
    })

    if (existingUser) {
        throw createError({
            statusCode: 409,
            statusMessage: 'Conflict',
            message: 'User with this email already exists',
        })
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password)

    // Create user with roles
    const user = await prisma.user.create({
        data: {
            email: body.email,
            password: hashedPassword,
            name: body.name,
            userRoles: body.roleIds?.length
                ? {
                    create: body.roleIds.map((roleId) => ({ roleId })),
                }
                : undefined,
        },
        select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            createdAt: true,
            userRoles: {
                include: {
                    role: {
                        select: { id: true, name: true },
                    },
                },
            },
        },
    })

    setResponseStatus(event, 201)
    return {
        success: true,
        data: {
            ...user,
            roles: user.userRoles.map((ur) => ur.role),
            userRoles: undefined,
        },
    }
})
