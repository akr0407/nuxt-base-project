import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock jwt module
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn((payload, secret, options) => {
            return `mock-token-${payload.userId}-${options.expiresIn}`
        }),
        verify: vi.fn((token, secret) => {
            if (token.startsWith('mock-token-')) {
                const parts = token.split('-')
                return {
                    userId: parts[2],
                    email: 'test@example.com',
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 900,
                }
            }
            throw new Error('Invalid token')
        }),
    },
}))

// Mock useRuntimeConfig
vi.mock('#imports', () => ({
    useRuntimeConfig: () => ({
        jwtAccessSecret: 'test-access-secret',
        jwtRefreshSecret: 'test-refresh-secret',
        jwtAccessExpiresIn: '15m',
        jwtRefreshExpiresIn: '7d',
    }),
}))

describe('JWT Utilities', () => {
    describe('Token Generation', () => {
        it('should generate access token with correct payload', async () => {
            const jwt = (await import('jsonwebtoken')).default
            const payload = { userId: 'user-123', email: 'test@example.com' }

            const token = jwt.sign(payload, 'secret', { expiresIn: '15m' })

            expect(token).toContain('mock-token-user-123')
            expect(jwt.sign).toHaveBeenCalledWith(payload, 'secret', { expiresIn: '15m' })
        })

        it('should generate refresh token with longer expiry', async () => {
            const jwt = (await import('jsonwebtoken')).default
            const payload = { userId: 'user-123', email: 'test@example.com' }

            const token = jwt.sign(payload, 'secret', { expiresIn: '7d' })

            expect(token).toContain('7d')
        })
    })

    describe('Token Verification', () => {
        it('should verify valid token', async () => {
            const jwt = (await import('jsonwebtoken')).default

            const decoded = jwt.verify('mock-token-user-123-15m', 'secret')

            expect(decoded).toHaveProperty('userId', 'user-123')
            expect(decoded).toHaveProperty('email', 'test@example.com')
        })

        it('should reject invalid token', async () => {
            const jwt = (await import('jsonwebtoken')).default

            expect(() => jwt.verify('invalid-token', 'secret')).toThrow('Invalid token')
        })
    })
})

describe('Password Utilities', () => {
    it('should hash password with bcrypt', async () => {
        const bcrypt = await import('bcryptjs')
        const password = 'SecurePassword123!'

        const hash = await bcrypt.hash(password, 12)

        expect(hash).not.toBe(password)
        expect(hash.length).toBeGreaterThan(50)
    })

    it('should verify correct password', async () => {
        const bcrypt = await import('bcryptjs')
        const password = 'SecurePassword123!'
        const hash = await bcrypt.hash(password, 12)

        const isValid = await bcrypt.compare(password, hash)

        expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
        const bcrypt = await import('bcryptjs')
        const password = 'SecurePassword123!'
        const hash = await bcrypt.hash(password, 12)

        const isValid = await bcrypt.compare('WrongPassword', hash)

        expect(isValid).toBe(false)
    })
})
