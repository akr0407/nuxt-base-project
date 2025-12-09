import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { isSuperAdmin } from '~/server/utils/tenant'

const createTenantSchema = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    isActive: z.boolean().default(true),
})

export default defineEventHandler(async (event) => {
    await requireAuth(event)

    if (!isSuperAdmin(event)) {
        throw createError({ statusCode: 403, message: 'SuperAdmin access required' })
    }

    await requirePermission(event, 'tenants:create')

    const body = await validateBody(event, createTenantSchema)

    // Check if slug already exists
    const existing = await prisma.tenant.findUnique({
        where: { slug: body.slug },
    })
    if (existing) {
        throw createError({ statusCode: 409, message: 'Tenant with this slug already exists' })
    }

    const tenant = await prisma.tenant.create({
        data: {
            name: body.name,
            slug: body.slug,
            isActive: body.isActive,
        },
    })

    // Create default theme settings for the new tenant
    await prisma.settings.create({
        data: {
            key: 'theme',
            value: {
                primaryColor: '#0ea5e9',
                primaryColorHover: '#0284c7',
                primaryColorPressed: '#0369a1',
                secondaryColor: '#6366f1',
                sidebarCollapsed: false,
                darkMode: false,
            },
            tenantId: tenant.id,
        },
    })

    return { success: true, data: tenant }
})
