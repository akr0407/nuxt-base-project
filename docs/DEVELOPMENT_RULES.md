# Development Rules

Guidelines for developing and maintaining this Nuxt 3 base project.

## Code Style

### TypeScript
- Use strict TypeScript (`strict: true`)
- Define interfaces for all data structures
- Avoid `any` type - use `unknown` or proper typing
- Use Zod for runtime validation schemas

### Vue Components
- Use `<script setup lang="ts">` syntax
- Use Composition API exclusively
- Keep components under 200 lines - extract logic to composables
- Use `defineProps` and `defineEmits` with TypeScript types

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserCard.vue` |
| Composables | camelCase with `use` prefix | `useAuth.ts` |
| Stores | camelCase | `auth.ts` |
| API routes | kebab-case | `user-roles.get.ts` |
| Utilities | camelCase | `formatDate.ts` |

## File Organization

```
server/
├── api/           # API route handlers
│   └── [resource]/
│       ├── index.get.ts    # GET /api/resource
│       ├── index.post.ts   # POST /api/resource
│       └── [id].get.ts     # GET /api/resource/:id
└── utils/         # Server utilities (shared across routes)

composables/       # Client-side composable functions
stores/            # Pinia stores
components/        # Vue components
pages/             # File-based routing
```

## API Development

### Route Handler Pattern
```typescript
export default defineEventHandler(async (event) => {
  // 1. Auth check
  await requireAuth(event)
  await requirePermission(event, 'resource:action')
  
  // 2. Validate input
  const body = await validateBody(event, schema)
  
  // 3. Business logic
  const result = await prisma.resource.create({ data: body })
  
  // 4. Return response
  return { success: true, data: result }
})
```

### Error Handling
- Use `createError()` for HTTP errors
- Include descriptive messages
- Return consistent error shape: `{ statusCode, statusMessage, message }`

## Database

### Prisma Conventions
- Use UUID for primary keys
- Include `createdAt` and `updatedAt` on all models
- Use `@@map()` for table names (snake_case)
- Define indexes for frequently queried fields

### Migrations
- Always use `prisma migrate dev` in development
- Never edit migration files after they're committed
- Update seed file when adding new required data

## Security

### Authentication
- Access tokens: 15 minutes expiry, stored in memory
- Refresh tokens: 7 days expiry, httpOnly cookie
- Always rotate refresh tokens on use
- Revoke all tokens on security events

### Authorization
- Check permissions at the route handler level using `requirePermission()`
- Never trust client-side permission checks alone
- Use the principle of least privilege for new roles

### Input Validation
- Validate ALL user input with Zod schemas
- Sanitize data before database operations
- Use parameterized queries (Prisma handles this)

## Testing

### Unit Tests (Vitest)
- Test utility functions and business logic
- Mock external dependencies (Prisma, APIs)
- Aim for >80% coverage on critical paths

### E2E Tests (Playwright)
- Test complete user flows
- Include authentication scenarios
- Test permission-based access control

## Git Workflow

### Commit Messages
Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Adding tests

### Pre-commit Hooks
Husky runs automatically:
1. ESLint fix
2. Prettier format

## Performance

- Use `<ClientOnly>` for Naive UI components (SSR issues)
- Lazy-load heavy components with `defineAsyncComponent`
- Use `useFetch` with caching for API calls
- Optimize database queries with proper indexes
