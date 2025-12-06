import prisma from '../../utils/prisma'
import { requireAuth, requirePermission } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'permissions:read')

    const permissions = await prisma.permission.findMany({
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
        },
    })

    return {
        success: true,
        data: permissions,
    }
})
