import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'
import { getUserPermissions, getUserRoles } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)

    const [permissions, roles] = await Promise.all([
        getUserPermissions(user.id),
        getUserRoles(user.id),
    ])

    const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            email: true,
            name: true,
            isSuperAdmin: true,
            tenantId: true,
            createdAt: true,
            tenant: {
                select: { id: true, name: true, slug: true },
            },
        },
    })

    return {
        success: true,
        user: fullUser,
        roles,
        permissions,
    }
})
