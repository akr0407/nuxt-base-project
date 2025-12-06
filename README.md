# Nuxt 3 Base Project

A production-ready Nuxt 3 starter template with authentication, RBAC (Role-Based Access Control), Prisma ORM, API documentation, and Naive UI components.

## Features

- 🔐 **Authentication**: JWT access tokens + rotating refresh tokens (httpOnly cookies)
- 👥 **RBAC**: User, Role, Permission management with middleware protection
- 🗄️ **Database**: PostgreSQL with Prisma ORM, migrations, and seeding
- 📚 **API Docs**: OpenAPI spec from Zod schemas, Swagger UI at `/docs`
- 🎨 **UI**: Naive UI components + Lucide Vue icons
- 🎯 **TypeScript**: Full type safety throughout
- 🧪 **Testing**: Vitest (unit) + Playwright (E2E)
- 🚀 **CI/CD**: GitHub Actions workflow

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for PostgreSQL)
- npm or pnpm

### Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd nuxt-base-project
   npm install
   ```

2. **Start PostgreSQL**:
   ```bash
   docker compose up -d
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Run database migrations and seed**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Open in browser**: http://localhost:3000

### Default Admin Credentials

```
Email: admin@example.com
Password: Admin123!
```

> ⚠️ **Important**: Change these credentials in production!

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run test:unit` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
├── .github/workflows/   # CI/CD configuration
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
├── server/
│   ├── api/             # API routes
│   │   ├── auth/        # Auth endpoints
│   │   ├── users/       # User CRUD
│   │   ├── roles/       # Role management
│   │   └── permissions/ # Permission listing
│   └── utils/           # Server utilities
├── stores/              # Pinia stores
├── pages/               # Vue pages
├── layouts/             # App layouts
├── components/          # Vue components
├── middleware/          # Route middleware
├── plugins/             # Nuxt plugins
└── tests/               # Test files
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns access token |
| POST | `/api/auth/refresh` | Rotate refresh token |
| POST | `/api/auth/logout` | Logout, revoke token |
| GET | `/api/auth/me` | Get current user info |

### Users (requires authentication)

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/users` | `users:read` | List users |
| POST | `/api/users` | `users:create` | Create user |
| GET | `/api/users/:id` | `users:read` | Get user |
| PUT | `/api/users/:id` | `users:update` | Update user |
| DELETE | `/api/users/:id` | `users:delete` | Delete user |

### Roles (requires authentication)

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/roles` | `roles:read` | List roles |
| POST | `/api/roles` | `roles:create` | Create role |
| GET | `/api/roles/:id` | `roles:read` | Get role |
| PUT | `/api/roles/:id` | `roles:update` | Update role |

### Permissions

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/permissions` | `permissions:read` | List permissions |

### API Documentation

- **Swagger UI**: http://localhost:3000/docs
- **OpenAPI JSON**: http://localhost:3000/api/openapi.json

## Default Permissions

| Permission | Description |
|------------|-------------|
| `users:read` | View users |
| `users:create` | Create users |
| `users:update` | Update users |
| `users:delete` | Delete users |
| `roles:read` | View roles |
| `roles:create` | Create roles |
| `roles:update` | Update roles |
| `permissions:read` | View permissions |

## Default Roles

- **admin**: All permissions
- **user**: Read-only permissions (`users:read`, `roles:read`, `permissions:read`)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_ACCESS_SECRET` | Access token secret (32+ chars) | Required |
| `JWT_REFRESH_SECRET` | Refresh token secret (32+ chars) | Required |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `NUXT_PUBLIC_APP_NAME` | Application name | `Nuxt Base Project` |

## Docker Services

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f
```

- **PostgreSQL**: `localhost:5432`
- **Adminer** (DB GUI): http://localhost:8080

## Testing

### Unit Tests (Vitest)

```bash
# Run once
npm run test:unit

# Watch mode
npm run test:unit:watch
```

### E2E Tests (Playwright)

```bash
# Run tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

## Development

### Adding New Permissions

1. Add to `prisma/seed.ts`:
   ```ts
   { name: 'new:permission', description: 'Description' }
   ```

2. Re-run seed:
   ```bash
   npm run db:seed
   ```

### Creating Protected API Routes

```ts
// server/api/example.get.ts
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  await requirePermission(event, 'example:read')
  
  // Your logic here
})
```

## License

MIT
