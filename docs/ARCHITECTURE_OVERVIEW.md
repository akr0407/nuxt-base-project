# Architecture Overview

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Nuxt 3 | Full-stack Vue framework |
| Language | TypeScript | Type safety |
| Database | PostgreSQL | Relational data storage |
| ORM | Prisma | Type-safe database access |
| Auth | JWT + httpOnly cookies | Secure authentication |
| UI | Naive UI | Component library |
| Icons | Lucide Vue | Icon library |
| State | Pinia | Client state management |
| Styling | Tailwind CSS | Utility-first CSS |
| Validation | Zod | Schema validation |

## Application Layers

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  Pages → Components → Stores → Composables  │
└─────────────────────┬───────────────────────┘
                      │ $fetch / API Client
┌─────────────────────▼───────────────────────┐
│               Server API                     │
│  Routes → Middleware → Utils → Prisma       │
└─────────────────────┬───────────────────────┘
                      │ Prisma Client
┌─────────────────────▼───────────────────────┐
│               PostgreSQL                     │
└─────────────────────────────────────────────┘
```

## Directory Structure

```
nuxt-base-project/
├── app/                    # Nuxt app config
│   └── router.options.ts   # Custom router behavior
├── assets/                 # Static assets (CSS, images)
├── components/             # Vue components
├── composables/            # Shared composition functions
├── layouts/                # Page layouts
├── middleware/             # Route middleware (client)
├── pages/                  # File-based routes
├── plugins/                # Nuxt plugins
├── prisma/                 # Database schema & migrations
├── public/                 # Static files (served as-is)
├── server/
│   ├── api/                # API route handlers
│   ├── middleware/         # Server middleware
│   └── utils/              # Server utilities
├── stores/                 # Pinia stores
├── tests/                  # Test files
├── types/                  # TypeScript declarations
└── docs/                   # Documentation
```

## Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Server  │         │    DB    │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │ POST /api/auth/login                    │
     │ {email, password}  │                    │
     │───────────────────►│                    │
     │                    │ verify password    │
     │                    │───────────────────►│
     │                    │◄───────────────────│
     │                    │                    │
     │                    │ create refresh token│
     │                    │───────────────────►│
     │                    │                    │
     │ Set-Cookie: refresh_token (httpOnly)    │
     │ {accessToken}      │                    │
     │◄───────────────────│                    │
     │                    │                    │
     │ Store accessToken  │                    │
     │ in Pinia store     │                    │
     │                    │                    │
```

## RBAC Model

```
┌──────────┐     ┌──────────┐     ┌─────────────┐
│   User   │────►│ UserRole │◄────│    Role     │
└──────────┘     └──────────┘     └──────┬──────┘
                                         │
                                  ┌──────▼──────┐
                                  │RolePermission│
                                  └──────┬──────┘
                                         │
                                  ┌──────▼──────┐
                                  │ Permission  │
                                  └─────────────┘
```

### Permission Format
`resource:action` (e.g., `users:create`, `roles:update`)

### Permission Check Flow
1. `requireAuth()` - Validates JWT, attaches user to context
2. `requirePermission('resource:action')` - Checks user has permission via roles
3. Route handler executes if authorized

## Key Files Reference

| File | Purpose |
|------|---------|
| `server/utils/prisma.ts` | Singleton Prisma client |
| `server/utils/jwt.ts` | JWT sign/verify/cookie helpers |
| `server/utils/auth.ts` | Auth middleware & validators |
| `server/utils/permissions.ts` | Permission checking functions |
| `server/utils/schemas.ts` | Zod validation schemas |
| `stores/auth.ts` | Client auth state & actions |
| `plugins/api-client.ts` | $fetch wrapper with auth |
| `middleware/auth.ts` | Client route protection |

## Data Flow Example

**Creating a user:**

1. `pages/admin/users.vue` → Form submit
2. `$api('/api/users', { method: 'POST', body })` → API call
3. `server/api/users/index.post.ts` → Route handler
4. `requireAuth()` → Validate token
5. `requirePermission('users:create')` → Check permission
6. `validateBody(event, createUserSchema)` → Validate input
7. `prisma.user.create()` → Database insert
8. Return `{ success: true, data: user }`
