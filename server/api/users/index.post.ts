import prisma from '../../utils/prisma'
import { requireAuth, requirePermission, validateBody } from '../../utils/auth'
import { createUserSchema } from '../../utils/schemas'
import { hashPassword } from '../../utils/password'
import { getTenantId, isSuperAdmin, requireTenantId } from '../../utils/tenant'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'users:create')

    const body = await validateBody(event, createUserSchema)
    const userIsSuperAdmin = isSuperAdmin(event)

    // Determine tenant for new user
    // SuperAdmins can create users in any tenant via X-Tenant-Id header
    // Regular users can only create users in their own tenant
    let targetTenantId: string | null = null

    if (userIsSuperAdmin) {
        // SuperAdmin can create:
        // - SuperAdmin users (no tenant)
        // - Tenant users (with X-Tenant-Id header)
        targetTenantId = getTenantId(event)
    } else {
        targetTenantId = requireTenantId(event)
    }

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
            tenantId: targetTenantId,
            isSuperAdmin: false, // Only seed/manual can create SuperAdmins
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
            isSuperAdmin: true,
            tenantId: true,
            createdAt: true,
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
