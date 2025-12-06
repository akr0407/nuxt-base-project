import prisma from '../../utils/prisma'
import { requireAuth, requirePermission, validateQuery } from '../../utils/auth'
import { paginationSchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'users:read')

    const { page, limit, search } = validateQuery(event, paginationSchema)
    const skip = (page - 1) * limit

    const where = search
        ? {
            OR: [
                { email: { contains: search, mode: 'insensitive' as const } },
                { name: { contains: search, mode: 'insensitive' as const } },
            ],
        }
        : {}

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
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
        }),
        prisma.user.count({ where }),
    ])

    // Transform to flatten roles
    const transformedUsers = users.map((user) => ({
        ...user,
        roles: user.userRoles.map((ur) => ur.role),
        userRoles: undefined,
    }))

    return {
        success: true,
        data: transformedUsers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
})
