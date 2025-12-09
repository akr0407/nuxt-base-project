export default defineEventHandler(async (event) => {
    await requireAuth(event)
    await requirePermission(event, 'settings:update')

    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'Template ID is required' })
    }

    await prisma.themeTemplate.delete({
        where: { id },
    })

    return { success: true, message: 'Template deleted' }
})
