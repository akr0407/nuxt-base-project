export default defineEventHandler(async () => {
    const templates = await prisma.themeTemplate.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: templates }
})
