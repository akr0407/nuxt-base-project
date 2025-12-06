import { randomUUID } from 'crypto'
import prisma from '../../utils/prisma'
import {
    verifyRefreshToken,
    signAccessToken,
    signRefreshToken,
    setRefreshTokenCookie,
    getRefreshTokenFromCookie,
    getRefreshTokenExpiry,
} from '../../utils/jwt'

export default defineEventHandler(async (event) => {
    const currentToken = getRefreshTokenFromCookie(event)

    if (!currentToken) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Refresh token is required',
        })
    }

    // Verify the token signature
    const decoded = verifyRefreshToken(currentToken)

    if (!decoded) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Invalid or expired refresh token',
        })
    }

    // Find the token in database
    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: currentToken },
        include: { user: true },
    })

    if (!storedToken) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Refresh token not found',
        })
    }

    // Check if token is revoked
    if (storedToken.revokedAt) {
        // Token reuse detected - revoke all tokens for this user (security measure)
        await prisma.refreshToken.updateMany({
            where: { userId: storedToken.userId },
            data: { revokedAt: new Date() },
        })

        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Token has been revoked',
        })
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Refresh token has expired',
        })
    }

    // Check if user is still active
    if (!storedToken.user.isActive) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'User account is deactivated',
        })
    }

    // Revoke the old token
    await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
    })

    // Generate new tokens
    const tokenPayload = { userId: storedToken.userId, email: storedToken.user.email }
    const newAccessToken = signAccessToken(tokenPayload)
    const newRefreshToken = signRefreshToken(tokenPayload)

    // Store new refresh token
    await prisma.refreshToken.create({
        data: {
            id: randomUUID(),
            token: newRefreshToken,
            userId: storedToken.userId,
            expiresAt: getRefreshTokenExpiry(),
        },
    })

    // Set new refresh token cookie
    setRefreshTokenCookie(event, newRefreshToken)

    return {
        success: true,
        accessToken: newAccessToken,
    }
})
