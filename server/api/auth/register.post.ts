import prisma from '../../utils/prisma'
import { hashPassword } from '../../utils/password'
import { registerSchema } from '../../utils/schemas'
import { validateBody } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const body = await validateBody(event, registerSchema)

    // Check if user already exists
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

    // Create user with default 'user' role
    const defaultRole = await prisma.role.findUnique({
        where: { name: 'user' },
    })

    const user = await prisma.user.create({
        data: {
            email: body.email,
            password: hashedPassword,
            name: body.name,
            userRoles: defaultRole
                ? {
                    create: {
                        roleId: defaultRole.id,
                    },
                }
                : undefined,
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        },
    })

    setResponseStatus(event, 201)
    return {
        success: true,
        message: 'User registered successfully',
        user,
    }
})
