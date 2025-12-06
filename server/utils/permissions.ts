import prisma from './prisma'

/**
 * Get all permissions for a user via their roles
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
    const userWithRoles = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            userRoles: {
                include: {
                    role: {
                        include: {
                            rolePermissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    if (!userWithRoles) {
        return []
    }

    const permissions = new Set<string>()

    for (const userRole of userWithRoles.userRoles) {
        for (const rolePermission of userRole.role.rolePermissions) {
            permissions.add(rolePermission.permission.name)
        }
    }

    return Array.from(permissions)
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await getUserPermissions(userId)
    return permissions.includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export async function hasAnyPermission(userId: string, requiredPermissions: string[]): Promise<boolean> {
    const permissions = await getUserPermissions(userId)
    return requiredPermissions.some((p) => permissions.includes(p))
}

/**
 * Check if a user has all of the specified permissions
 */
export async function hasAllPermissions(userId: string, requiredPermissions: string[]): Promise<boolean> {
    const permissions = await getUserPermissions(userId)
    return requiredPermissions.every((p) => permissions.includes(p))
}

/**
 * Get all roles for a user
 */
export async function getUserRoles(userId: string): Promise<string[]> {
    const userWithRoles = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            userRoles: {
                include: {
                    role: true,
                },
            },
        },
    })

    if (!userWithRoles) {
        return []
    }

    return userWithRoles.userRoles.map((ur) => ur.role.name)
}
