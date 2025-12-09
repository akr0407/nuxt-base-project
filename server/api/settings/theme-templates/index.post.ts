import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireTenantId, isSuperAdmin } from '~/server/utils/tenant'

const createTemplateSchema = z.object({
    name: z.string().min(1).max(50),
    settings: z.object({
        primaryColor: z.string(),
        primaryColorHover: z.string().optional(),
        primaryColorPressed: z.string().optional(),
        secondaryColor: z.string(),
        sidebarCollapsed: z.boolean().optional(),
        darkMode: z.boolean(),
    }),
    isGlobal: z.boolean().optional(), // Only SuperAdmin can create global templates
})

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'settings:update')

    const body = await validateBody(event, createTemplateSchema)
    const isGlobal = body.isGlobal === true && isSuperAdmin(event)

    // For tenant templates, require tenant context
    const tenantId = isGlobal ? null : requireTenantId(event)

    const template = await prisma.themeTemplate.create({
        data: {
            name: body.name,
            settings: body.settings,
            isGlobal,
            tenantId,
        },
    })

    return { success: true, data: template }
})
