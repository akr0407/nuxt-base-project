import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { isSuperAdmin } from '~/server/utils/tenant'

const querySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    search: z.string().optional(),
})

export default defineEventHandler(async (event) => {
    await requireAuth(event)

    // Only SuperAdmins can list all tenants
    if (!isSuperAdmin(event)) {
        throw createError({ statusCode: 403, message: 'SuperAdmin access required' })
    }

    await requirePermission(event, 'tenants:read')

    const query = validateQuery(event, querySchema)
    const skip = (query.page - 1) * query.limit

    const where = query.search
        ? {
            OR: [
                { name: { contains: query.search, mode: 'insensitive' as const } },
                { slug: { contains: query.search, mode: 'insensitive' as const } },
            ],
        }
        : {}

    const [tenants, total] = await Promise.all([
        prisma.tenant.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: query.limit,
            include: {
                _count: {
                    select: { users: true },
                },
            },
        }),
        prisma.tenant.count({ where }),
    ])

    return {
        success: true,
        data: tenants.map(t => ({
            ...t,
            userCount: t._count.users,
            _count: undefined,
        })),
        meta: {
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        },
    }
})
