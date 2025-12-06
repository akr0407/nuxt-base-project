import { OpenAPIRegistry, OpenApiGeneratorV31, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import {
    registerSchema,
    loginSchema,
    createUserSchema,
    updateUserSchema,
    createRoleSchema,
    updateRoleSchema,
    paginationSchema,
} from './schemas'

// Extend Zod with OpenAPI
extendZodWithOpenApi(z)

// Create registry
const registry = new OpenAPIRegistry()

// Common response schemas
const successResponseSchema = z.object({
    success: z.boolean(),
})

const errorResponseSchema = z.object({
    statusCode: z.number(),
    statusMessage: z.string(),
    message: z.string(),
})

const userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional(),
    roles: z.array(z.object({
        id: z.string().uuid(),
        name: z.string(),
    })).optional(),
})

const roleSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional(),
    permissions: z.array(z.object({
        id: z.string().uuid(),
        name: z.string(),
    })).optional(),
    userCount: z.number().optional(),
})

const permissionSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string().datetime(),
})

const paginationResponseSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
})

// Security scheme
registry.registerComponent('securitySchemes', 'BearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
})

// Auth endpoints
registry.registerPath({
    method: 'post',
    path: '/api/auth/register',
    tags: ['Authentication'],
    summary: 'Register a new user',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: registerSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'User registered successfully',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        message: z.string(),
                        user: userSchema.pick({ id: true, email: true, name: true, createdAt: true }),
                    }),
                },
            },
        },
        409: {
            description: 'User already exists',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
})

registry.registerPath({
    method: 'post',
    path: '/api/auth/login',
    tags: ['Authentication'],
    summary: 'Login and get access token',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: loginSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Login successful',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        accessToken: z.string(),
                        user: userSchema.pick({ id: true, email: true, name: true }),
                    }),
                },
            },
        },
        401: {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
})

registry.registerPath({
    method: 'post',
    path: '/api/auth/refresh',
    tags: ['Authentication'],
    summary: 'Refresh access token',
    description: 'Uses the httpOnly refresh token cookie to issue a new access token',
    responses: {
        200: {
            description: 'Token refreshed',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        accessToken: z.string(),
                    }),
                },
            },
        },
        401: {
            description: 'Invalid or expired refresh token',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
})

registry.registerPath({
    method: 'post',
    path: '/api/auth/logout',
    tags: ['Authentication'],
    summary: 'Logout and revoke refresh token',
    responses: {
        200: {
            description: 'Logged out successfully',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        message: z.string(),
                    }),
                },
            },
        },
    },
})

registry.registerPath({
    method: 'get',
    path: '/api/auth/me',
    tags: ['Authentication'],
    summary: 'Get current authenticated user',
    security: [{ BearerAuth: [] }],
    responses: {
        200: {
            description: 'Current user info',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        user: userSchema,
                        roles: z.array(z.string()),
                        permissions: z.array(z.string()),
                    }),
                },
            },
        },
        401: {
            description: 'Not authenticated',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
})

// Users endpoints
registry.registerPath({
    method: 'get',
    path: '/api/users',
    tags: ['Users'],
    summary: 'List all users',
    security: [{ BearerAuth: [] }],
    request: {
        query: paginationSchema,
    },
    responses: {
        200: {
            description: 'List of users',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        data: z.array(userSchema),
                        pagination: paginationResponseSchema,
                    }),
                },
            },
        },
    },
})

registry.registerPath({
    method: 'post',
    path: '/api/users',
    tags: ['Users'],
    summary: 'Create a new user',
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createUserSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'User created',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        data: userSchema,
                    }),
                },
            },
        },
    },
})

registry.registerPath({
    method: 'get',
    path: '/api/users/{id}',
    tags: ['Users'],
    summary: 'Get a user by ID',
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            id: z.string().uuid(),
        }),
    },
    responses: {
        200: {
            description: 'User details',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        data: userSchema,
                    }),
                },
            },
        },
        404: {
            description: 'User not found',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
})

registry.registerPath({
    method: 'put',
    path: '/api/users/{id}',
    tags: ['Users'],
    summary: 'Update a user',
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            id: z.string().uuid(),
        }),
        body: {
            content: {
                'application/json': {
                    schema: updateUserSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'User updated',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        data: userSchema,
                    }),
                },
            },
        },
    },
})

registry.registerPath({
    method: 'delete',
    path: '/api/users/{id}',
    tags: ['Users'],
    summary: 'Delete a user',
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            id: z.string().uuid(),
        }),
    },
    responses: {
        200: {
            description: 'User deleted',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        message: z.string(),
                    }),
                },
            },
        },
    },
})

// Roles endpoints
registry.registerPath({
    method: 'get',
    path: '/api/roles',
    tags: ['Roles'],
    summary: 'List all roles',
    security: [{ BearerAuth: [] }],
    request: {
        query: paginationSchema,
    },
    responses: {
        200: {
            description: 'List of roles',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        data: z.array(roleSchema),
                        pagination: paginationResponseSchema,
                    }),
                },
            },
        },
    },
})

registry.registerPath({
    method: 'post',
    path: '/api/roles',
    tags: ['Roles'],
    summary: 'Create a new role',
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createRoleSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Role created',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        data: roleSchema,
                    }),
                },
            },
        },
    },
})

registry.registerPath({
    method: 'get',
    path: '/api/roles/{id}',
    tags: ['Roles'],
    summary: 'Get a role by ID',
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            id: z.string().uuid(),
        }),
    },
    responses: {
        200: {
            description: 'Role details',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        data: roleSchema,
                    }),
                },
            },
        },
    },
})

registry.registerPath({
    method: 'put',
    path: '/api/roles/{id}',
    tags: ['Roles'],
    summary: 'Update a role',
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            id: z.string().uuid(),
        }),
        body: {
            content: {
                'application/json': {
                    schema: updateRoleSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Role updated',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        data: roleSchema,
                    }),
                },
            },
        },
    },
})

// Permissions endpoints
registry.registerPath({
    method: 'get',
    path: '/api/permissions',
    tags: ['Permissions'],
    summary: 'List all permissions',
    security: [{ BearerAuth: [] }],
    responses: {
        200: {
            description: 'List of permissions',
            content: {
                'application/json': {
                    schema: successResponseSchema.extend({
                        data: z.array(permissionSchema),
                    }),
                },
            },
        },
    },
})

// Generate OpenAPI document
export function generateOpenAPIDocument() {
    const generator = new OpenApiGeneratorV31(registry.definitions)

    return generator.generateDocument({
        openapi: '3.1.0',
        info: {
            title: 'Nuxt Base Project API',
            version: '1.0.0',
            description: 'REST API for the Nuxt Base Project with authentication and RBAC',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        tags: [
            { name: 'Authentication', description: 'Auth endpoints' },
            { name: 'Users', description: 'User management' },
            { name: 'Roles', description: 'Role management' },
            { name: 'Permissions', description: 'Permission management' },
        ],
    })
}
