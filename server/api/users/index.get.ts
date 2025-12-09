import prisma from '../../utils/prisma'
import { requireAuth, requirePermission, validateQuery } from '../../utils/auth'
import { paginationSchema } from '../../utils/schemas'
import { getTenantId, isSuperAdmin } from '../../utils/tenant'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'users:read')

    const { page, limit, search } = validateQuery(event, paginationSchema)
    const skip = (page - 1) * limit
    const tenantId = getTenantId(event)
    const userIsSuperAdmin = isSuperAdmin(event)

    // Build where clause with tenant scope
    const where: any = {}

    // SuperAdmins can see all users, or filter by tenant via header
    // Regular users can only see users in their tenant
    if (!userIsSuperAdmin && tenantId) {
        where.tenantId = tenantId
    } else if (tenantId) {
        // SuperAdmin with X-Tenant-Id header - filter to that tenant
        where.tenantId = tenantId
    }

    if (search) {
        where.OR = [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
        ]
    }

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
                isSuperAdmin: true,
                tenantId: true,
                createdAt: true,
                updatedAt: true,
                tenant: {
                    select: { id: true, name: true, slug: true },
                },
                userRoles: {
                    include: {
                        role: {
                            select: { id: true, name: true, isGlobal: true },
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
