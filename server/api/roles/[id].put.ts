import prisma from '../../utils/prisma'
import { requireAuth, requirePermission, validateBody } from '../../utils/auth'
import { updateRoleSchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'roles:update')

    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Role ID is required',
        })
    }

    const body = await validateBody(event, updateRoleSchema)

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
        where: { id },
    })

    if (!existingRole) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
            message: 'Role not found',
        })
    }

    // Check name uniqueness if updating name
    if (body.name && body.name !== existingRole.name) {
        const nameTaken = await prisma.role.findUnique({
            where: { name: body.name },
        })
        if (nameTaken) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Conflict',
                message: 'Role name is already in use',
            })
        }
    }

    // Update role and permissions
    const role = await prisma.$transaction(async (tx) => {
        // Update role fields
        const updated = await tx.role.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
            },
        })

        // Update permissions if provided
        if (body.permissionIds !== undefined) {
            // Delete existing permissions
            await tx.rolePermission.deleteMany({
                where: { roleId: id },
            })

            // Add new permissions
            if (body.permissionIds.length > 0) {
                await tx.rolePermission.createMany({
                    data: body.permissionIds.map((permissionId) => ({
                        roleId: id,
                        permissionId,
                    })),
                })
            }
        }

        return updated
    })

    // Fetch updated role with permissions
    const roleWithPermissions = await prisma.role.findUnique({
        where: { id },
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

    return {
        success: true,
        data: {
            id: roleWithPermissions?.id,
            name: roleWithPermissions?.name,
            description: roleWithPermissions?.description,
            createdAt: roleWithPermissions?.createdAt,
            updatedAt: roleWithPermissions?.updatedAt,
            permissions: roleWithPermissions?.rolePermissions.map((rp) => rp.permission),
        },
    }
})
