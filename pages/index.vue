<template>
  <div class="min-h-[calc(100vh-128px)]">
    <!-- Hero Section -->
    <div class="text-center py-12 px-4">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Nuxt 3 Base Project</h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
        A production-ready starter template with authentication, RBAC, and modern UI components.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <template v-if="!authStore.isAuthenticated">
          <NuxtLink to="/register">
            <Button size="lg">
              <UserPlus class="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </NuxtLink>
          <NuxtLink to="/docs">
            <Button variant="outline" size="lg">
              <BookOpen class="w-5 h-5 mr-2" />
              View Documentation
            </Button>
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/admin/users">
            <Button size="lg">
              <Users class="w-5 h-5 mr-2" />
              Manage Users
            </Button>
          </NuxtLink>
          <NuxtLink to="/docs">
            <Button variant="outline" size="lg">
              <BookOpen class="w-5 h-5 mr-2" />
              API Documentation
            </Button>
          </NuxtLink>
        </template>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-12 px-4">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Built with Modern Technologies
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card v-for="feature in features" :key="feature.title">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg" :class="feature.iconBg">
                  <component :is="feature.icon" class="w-5 h-5" :class="feature.iconColor" />
                </div>
                <CardTitle class="text-lg">{{ feature.title }}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p class="text-gray-600 dark:text-gray-400 text-sm">{{ feature.description }}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserPlus, BookOpen, Users, Shield, Database, FileCode, Palette } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
})

const authStore = useAuthStore()

const features = [
  {
    title: 'Authentication',
    description: 'JWT access tokens with rotating refresh tokens stored in httpOnly cookies.',
    icon: Shield,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    title: 'RBAC',
    description: 'Role-based access control with users, roles, and granular permissions.',
    icon: Users,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Prisma ORM',
    description: 'Type-safe database access with PostgreSQL, migrations, and seeding.',
    icon: Database,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    title: 'API Documentation',
    description: 'OpenAPI spec generated from Zod schemas, served via Swagger UI.',
    icon: FileCode,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    title: 'shadcn-vue',
    description: 'Beautiful, accessible components built with Radix Vue and Tailwind CSS.',
    icon: Palette,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
  {
    title: 'TypeScript',
    description: 'Full type safety throughout the entire stack, from frontend to backend.',
    icon: FileCode,
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
  },
]
</script>
