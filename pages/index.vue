<template>
  <div class="bg-gradient-to-br from-primary-50 to-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Nuxt 3 Base Project
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A production-ready starter template with authentication, RBAC, Prisma ORM,
          API documentation, and Naive UI components.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <template v-if="!authStore.isAuthenticated">
            <NuxtLink to="/register">
              <n-button type="primary" size="large">
                <template #icon>
                  <component :is="icons.UserPlus" class="w-5 h-5" />
                </template>
                Get Started
              </n-button>
            </NuxtLink>
            <NuxtLink to="/docs">
              <n-button size="large">
                <template #icon>
                  <component :is="icons.BookOpen" class="w-5 h-5" />
                </template>
                API Documentation
              </n-button>
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink v-if="authStore.hasPermission('users:read')" to="/admin/users">
              <n-button type="primary" size="large">
                <template #icon>
                  <component :is="icons.Users" class="w-5 h-5" />
                </template>
                Manage Users
              </n-button>
            </NuxtLink>
            <NuxtLink to="/docs">
              <n-button size="large">
                <template #icon>
                  <component :is="icons.BookOpen" class="w-5 h-5" />
                </template>
                API Documentation
              </n-button>
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div class="grid md:grid-cols-3 gap-8">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
            :class="feature.iconBg"
          >
            <component :is="feature.icon" class="w-6 h-6" :class="feature.iconColor" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ feature.title }}</h3>
          <p class="text-gray-600">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'
import { UserPlus, BookOpen, Users, Shield, Database, FileCode } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['auth'],
})

const icons = { UserPlus, BookOpen, Users }

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
    description: 'Role-based access control with Users, Roles, and Permissions management.',
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
    title: 'Naive UI',
    description: 'Beautiful Vue 3 component library with TypeScript support.',
    icon: markRaw(defineComponent({
      render: () => h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
        h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }),
        h('path', { d: 'M3 9h18M9 21V9', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }),
      ]),
    })),
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
  {
    title: 'Testing Ready',
    description: 'Vitest for unit tests and Playwright for E2E testing, with CI setup.',
    icon: markRaw(defineComponent({
      render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
        h('path', { d: 'M9 12l2 2 4-4' }),
        h('circle', { cx: 12, cy: 12, r: 10 }),
      ]),
    })),
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
]
</script>
