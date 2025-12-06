import { z } from 'zod'
import type { H3Event } from 'h3'
import { verifyAccessToken, extractAccessToken } from '../utils/jwt'
import prisma from '../utils/prisma'
import { hasPermission } from '../utils/permissions'

export interface AuthUser {
    id: string
    email: string
    name: string | null
}

declare module 'h3' {
    interface H3EventContext {
        user?: AuthUser
    }
}

/**
 * Require authentication middleware
 * Validates the access token and attaches user to event context
 */
export async function requireAuth(event: H3Event): Promise<AuthUser> {
    const token = extractAccessToken(event)

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Access token is required',
        })
    }

    const decoded = verifyAccessToken(token)

    if (!decoded) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Invalid or expired access token',
        })
    }

    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, isActive: true },
    })

    if (!user || !user.isActive) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'User not found or inactive',
        })
    }

    event.context.user = {
        id: user.id,
        email: user.email,
        name: user.name,
    }

    return event.context.user
}

/**
 * Require specific permission
 * Must be called after requireAuth
 */
export async function requirePermission(event: H3Event, permission: string): Promise<void> {
    const user = event.context.user

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Authentication required',
        })
    }

    const allowed = await hasPermission(user.id, permission)

    if (!allowed) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: `Missing required permission: ${permission}`,
        })
    }
}

/**
 * Validate request body with Zod schema
 */
export async function validateBody<T>(event: H3Event, schema: z.ZodSchema<T>): Promise<T> {
    const body = await readBody(event)
    const result = schema.safeParse(body)

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Validation failed',
            data: result.error.flatten(),
        })
    }

    return result.data
}

/**
 * Validate query params with Zod schema
 */
export function validateQuery<T>(event: H3Event, schema: z.ZodSchema<T>): T {
    const query = getQuery(event)
    const result = schema.safeParse(query)

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Invalid query parameters',
            data: result.error.flatten(),
        })
    }

    return result.data
}
