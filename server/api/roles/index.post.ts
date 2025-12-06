import prisma from '../../utils/prisma'
import { requireAuth, requirePermission, validateBody } from '../../utils/auth'
import { createRoleSchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'roles:create')

    const body = await validateBody(event, createRoleSchema)

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
        where: { name: body.name },
    })

    if (existingRole) {
        throw createError({
            statusCode: 409,
            statusMessage: 'Conflict',
            message: 'Role with this name already exists',
        })
    }

    // Create role with permissions
    const role = await prisma.role.create({
        data: {
            name: body.name,
            description: body.description,
            rolePermissions: body.permissionIds?.length
                ? {
                    create: body.permissionIds.map((permissionId) => ({ permissionId })),
                }
                : undefined,
        },
        include: {
            rolePermissions: {
                include: {
                    permission: {
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
            id: role.id,
            name: role.name,
            description: role.description,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
            permissions: role.rolePermissions.map((rp) => rp.permission),
        },
    }
})
