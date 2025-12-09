import type { H3Event } from 'h3'
import prisma from './prisma'

export interface TenantContext {
    tenantId: string | null
    isSuperAdmin: boolean
    userId: string
}

/**
 * Get the tenant context from the authenticated user.
 * SuperAdmins can optionally specify a tenant via X-Tenant-Id header.
 */
export async function getTenantContext(event: H3Event): Promise<TenantContext | null> {
    const user = event.context.user
    if (!user) return null

    // SuperAdmins can access any tenant via header
    if (user.isSuperAdmin) {
        const headerTenantId = getHeader(event, 'x-tenant-id')
        return {
            tenantId: headerTenantId || null,
            isSuperAdmin: true,
            userId: user.id,
        }
    }

    return {
        tenantId: user.tenantId,
        isSuperAdmin: false,
        userId: user.id,
    }
}

/**
 * Get the tenant ID from the authenticated user.
 * SuperAdmins can specify a tenant via X-Tenant-Id header.
 * Returns null if no tenant context (SuperAdmin without header).
 */
export function getTenantId(event: H3Event): string | null {
    const user = event.context.user
    if (!user) return null

    // SuperAdmins can access any tenant via header
    if (user.isSuperAdmin) {
        return getHeader(event, 'x-tenant-id') || null
    }

    return user.tenantId || null
}

/**
 * Require a valid tenant context. Throws 400 if not available.
 * SuperAdmins must specify X-Tenant-Id header to access tenant data.
 */
export function requireTenantId(event: H3Event): string {
    const tenantId = getTenantId(event)
    if (!tenantId) {
        throw createError({
            statusCode: 400,
            message: 'Tenant context required. SuperAdmins must provide X-Tenant-Id header.',
        })
    }
    return tenantId
}

/**
 * Check if the current user is a SuperAdmin.
 */
export function isSuperAdmin(event: H3Event): boolean {
    return event.context.user?.isSuperAdmin === true
}

/**
 * Get tenant by ID with validation.
 */
export async function getTenantById(tenantId: string) {
    return prisma.tenant.findUnique({
        where: { id: tenantId },
    })
}

/**
 * Validate that a tenant exists and is active.
 */
export async function validateTenantAccess(tenantId: string): Promise<boolean> {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, isActive: true },
    })
    return tenant?.isActive === true
}

/**
 * For SuperAdmins: Get all tenants they can access.
 * For regular users: Get only their tenant.
 */
export async function getAccessibleTenants(event: H3Event) {
    const user = event.context.user
    if (!user) return []

    if (user.isSuperAdmin) {
        return prisma.tenant.findMany({
            orderBy: { name: 'asc' },
        })
    }

    if (user.tenantId) {
        const tenant = await prisma.tenant.findUnique({
            where: { id: user.tenantId },
        })
        return tenant ? [tenant] : []
    }

    return []
}
