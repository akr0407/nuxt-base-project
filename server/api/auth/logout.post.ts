import prisma from '../../utils/prisma'
import {
    getRefreshTokenFromCookie,
    clearRefreshTokenCookie,
} from '../../utils/jwt'

export default defineEventHandler(async (event) => {
    const currentToken = getRefreshTokenFromCookie(event)

    if (currentToken) {
        // Revoke the refresh token in database
        await prisma.refreshToken.updateMany({
            where: { token: currentToken },
            data: { revokedAt: new Date() },
        })
    }

    // Clear the cookie
    clearRefreshTokenCookie(event)

    return {
        success: true,
        message: 'Logged out successfully',
    }
})
