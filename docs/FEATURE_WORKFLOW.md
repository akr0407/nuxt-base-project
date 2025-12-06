# Feature Workflow

Step-by-step guide for implementing new features in this project.

## Overview

```
1. Plan → 2. Schema → 3. Backend → 4. Frontend → 5. Test → 6. Document
```

---

## Step 1: Plan the Feature

### Checklist
- [ ] Define the feature requirements
- [ ] Identify required permissions
- [ ] Design database schema changes
- [ ] List API endpoints needed
- [ ] Sketch UI components

### Example: Adding "Projects" feature
```
Feature: Users can create and manage projects
Permissions: projects:read, projects:create, projects:update, projects:delete
Tables: Project (id, name, description, userId, createdAt, updatedAt)
Endpoints: GET/POST /api/projects, GET/PUT/DELETE /api/projects/:id
Pages: /projects, /projects/:id
```

---

## Step 2: Database Schema

### 2.1 Update Prisma Schema
```prisma
// prisma/schema.prisma
model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("projects")
}
```

### 2.2 Add Relation to User
```prisma
model User {
  // ... existing fields
  projects Project[]
}
```

### 2.3 Run Migration
```bash
npm run db:migrate
# Enter migration name: add_projects
```

### 2.4 Add Permissions to Seed
```typescript
// prisma/seed.ts - Add to DEFAULT_PERMISSIONS
{ name: 'projects:read', description: 'View projects' },
{ name: 'projects:create', description: 'Create projects' },
{ name: 'projects:update', description: 'Update projects' },
{ name: 'projects:delete', description: 'Delete projects' },
```

### 2.5 Re-run Seed
```bash
npm run db:seed
```

---

## Step 3: Backend API

### 3.1 Create Validation Schemas
```typescript
// server/utils/schemas.ts
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})
```

### 3.2 Create API Routes

**List projects:** `server/api/projects/index.get.ts`
```typescript
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  await requirePermission(event, 'projects:read')
  
  const { page, limit } = validateQuery(event, paginationSchema)
  
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    skip: (page - 1) * limit,
    take: limit,
  })
  
  return { success: true, data: projects }
})
```

**Create project:** `server/api/projects/index.post.ts`
```typescript
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  await requirePermission(event, 'projects:create')
  
  const body = await validateBody(event, createProjectSchema)
  
  const project = await prisma.project.create({
    data: { ...body, userId: user.id },
  })
  
  setResponseStatus(event, 201)
  return { success: true, data: project }
})
```

### 3.3 Add to OpenAPI Spec
Update `server/utils/openapi.ts` to register new endpoints.

---

## Step 4: Frontend

### 4.1 Create Page
```vue
<!-- pages/projects/index.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold">Projects</h1>
    <!-- Project list -->
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const { $api } = useNuxtApp()
const { data: projects } = await useFetch('/api/projects')
</script>
```

### 4.2 Add Navigation
Update `components/AppHeader.vue`:
```typescript
if (authStore.hasPermission('projects:read')) {
  items.push({ path: '/projects', label: 'Projects' })
}
```

### 4.3 Create Components
- `components/ProjectCard.vue`
- `components/ProjectForm.vue`
- etc.

---

## Step 5: Testing

### 5.1 Unit Tests
```typescript
// tests/unit/projects.test.ts
describe('Project API', () => {
  it('should create project with valid data', () => {
    // Test validation schema
  })
})
```

### 5.2 E2E Tests
```typescript
// tests/e2e/projects.spec.ts
test('should create and list projects', async ({ page }) => {
  await page.goto('/projects')
  await page.getByRole('button', { name: 'New Project' }).click()
  // ...
})
```

### 5.3 Run Tests
```bash
npm run test:unit
npm run test:e2e
```

---

## Step 6: Document

### Update README
Add new endpoints to the API documentation section.

### Update OpenAPI
Ensure `/api/openapi.json` reflects new endpoints.

---

## Quick Reference

### Files to Modify/Create

| Layer | Files |
|-------|-------|
| Schema | `prisma/schema.prisma`, `prisma/seed.ts` |
| Validation | `server/utils/schemas.ts` |
| API | `server/api/[resource]/*.ts` |
| OpenAPI | `server/utils/openapi.ts` |
| Pages | `pages/[feature]/*.vue` |
| Components | `components/[Feature]*.vue` |
| Navigation | `components/AppHeader.vue` |
| Tests | `tests/unit/*.test.ts`, `tests/e2e/*.spec.ts` |

### Commands Cheatsheet

```bash
npm run db:migrate     # Create migration
npm run db:seed        # Seed database
npm run dev            # Start dev server
npm run test:unit      # Run unit tests
npm run test:e2e       # Run E2E tests
npm run lint           # Lint code
npm run typecheck      # Type check
```
