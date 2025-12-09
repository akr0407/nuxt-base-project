import { z } from 'zod'

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
})

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'settings:update')

    const body = await validateBody(event, createTemplateSchema)

    const template = await prisma.themeTemplate.create({
        data: {
            name: body.name,
            settings: body.settings,
        },
    })

    return { success: true, data: template }
})
