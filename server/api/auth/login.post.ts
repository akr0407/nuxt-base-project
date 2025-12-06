import { randomUUID } from 'crypto'
import prisma from '../../utils/prisma'
import { verifyPassword } from '../../utils/password'
import { loginSchema } from '../../utils/schemas'
import { validateBody } from '../../utils/auth'
import {
    signAccessToken,
    signRefreshToken,
    setRefreshTokenCookie,
    getRefreshTokenExpiry,
} from '../../utils/jwt'

export default defineEventHandler(async (event) => {
    const body = await validateBody(event, loginSchema)

    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email: body.email },
        select: {
            id: true,
            email: true,
            name: true,
            password: true,
            isActive: true,
        },
    })

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Invalid email or password',
        })
    }

    if (!user.isActive) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Account is deactivated',
        })
    }

    // Verify password
    const validPassword = await verifyPassword(body.password, user.password)

    if (!validPassword) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Invalid email or password',
        })
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email }
    const accessToken = signAccessToken(tokenPayload)
    const refreshToken = signRefreshToken(tokenPayload)

    // Store refresh token in database
    await prisma.refreshToken.create({
        data: {
            id: randomUUID(),
            token: refreshToken,
            userId: user.id,
            expiresAt: getRefreshTokenExpiry(),
        },
    })

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(event, refreshToken)

    return {
        success: true,
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
    }
})
