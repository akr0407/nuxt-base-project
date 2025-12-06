import prisma from '../../utils/prisma'
import { requireAuth, requirePermission, validateQuery } from '../../utils/auth'
import { paginationSchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'roles:read')

    const { page, limit, search } = validateQuery(event, paginationSchema)
    const skip = (page - 1) * limit

    const where = search
        ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
            ],
        }
        : {}

    const [roles, total] = await Promise.all([
        prisma.role.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: 'asc' },
            include: {
                rolePermissions: {
                    include: {
                        permission: {
                            select: { id: true, name: true },
                        },
                    },
                },
                _count: {
                    select: { userRoles: true },
                },
            },
        }),
        prisma.role.count({ where }),
    ])

    // Transform to flatten permissions
    const transformedRoles = roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        permissions: role.rolePermissions.map((rp) => rp.permission),
        userCount: role._count.userRoles,
    }))

    return {
        success: true,
        data: transformedRoles,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
})
