import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

export interface TokenPayload {
  userId: string
  email: string
}

export interface DecodedToken extends TokenPayload {
  iat: number
  exp: number
}

/**
 * Parse duration string to milliseconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/)
  if (!match) return 15 * 60 * 1000 // Default 15 minutes

  const value = parseInt(match[1])
  const unit = match[2]

  switch (unit) {
    case 's':
      return value * 1000
    case 'm':
      return value * 60 * 1000
    case 'h':
      return value * 60 * 60 * 1000
    case 'd':
      return value * 24 * 60 * 60 * 1000
    default:
      return value * 60 * 1000
  }
}

// Extended duration for "remember me" - 30 days
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000

/**
 * Sign an access token (short-lived)
 */
export function signAccessToken(payload: TokenPayload): string {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiresIn || '15m',
  })
}

/**
 * Sign a refresh token (long-lived)
 */
export function signRefreshToken(payload: TokenPayload): string {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn || '7d',
  })
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): DecodedToken | null {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwtAccessSecret) as DecodedToken
  } catch {
    return null
  }
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): DecodedToken | null {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwtRefreshSecret) as DecodedToken
  } catch {
    return null
  }
}

/**
 * Get refresh token expiration date
 */
export function getRefreshTokenExpiry(rememberMe: boolean = false): Date {
  if (rememberMe) {
    return new Date(Date.now() + REMEMBER_ME_DURATION)
  }
  const config = useRuntimeConfig()
  const duration = parseDuration(config.jwtRefreshExpiresIn || '7d')
  return new Date(Date.now() + duration)
}

/**
 * Extract access token from Authorization header
 */
export function extractAccessToken(event: H3Event): string | null {
  const authHeader = getHeader(event, 'Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

/**
 * Get refresh token from cookie
 */
export function getRefreshTokenFromCookie(event: H3Event): string | null {
  return getCookie(event, 'refresh_token') || null
}

/**
 * Set refresh token cookie
 */
export function setRefreshTokenCookie(
  event: H3Event,
  token: string,
  rememberMe: boolean = false
): void {
  const config = useRuntimeConfig()
  const duration = rememberMe
    ? REMEMBER_ME_DURATION
    : parseDuration(config.jwtRefreshExpiresIn || '7d')

  setCookie(event, 'refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Math.floor(duration / 1000),
    path: '/',
  })
}

/**
 * Clear refresh token cookie
 */
export function clearRefreshTokenCookie(event: H3Event): void {
  deleteCookie(event, 'refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}
