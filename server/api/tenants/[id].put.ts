import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { isSuperAdmin } from '~/server/utils/tenant'

const updateTenantSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
    isActive: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
    await requireAuth(event)

    if (!isSuperAdmin(event)) {
        throw createError({ statusCode: 403, message: 'SuperAdmin access required' })
    }

    await requirePermission(event, 'tenants:update')

    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'Tenant ID is required' })
    }

    const body = await validateBody(event, updateTenantSchema)

    // Check tenant exists
    const existing = await prisma.tenant.findUnique({ where: { id } })
    if (!existing) {
        throw createError({ statusCode: 404, message: 'Tenant not found' })
    }

    // If updating slug, check for conflicts
    if (body.slug && body.slug !== existing.slug) {
        const slugConflict = await prisma.tenant.findUnique({
            where: { slug: body.slug },
        })
        if (slugConflict) {
            throw createError({ statusCode: 409, message: 'Tenant with this slug already exists' })
        }
    }

    const tenant = await prisma.tenant.update({
        where: { id },
        data: body,
    })

    return { success: true, data: tenant }
})
