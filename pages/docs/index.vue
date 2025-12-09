<template>
  <div class="min-h-screen py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">API Documentation</h1>
        <p class="text-gray-600">
          Explore our API using your preferred documentation viewer
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <NuxtLink
          v-for="doc in docOptions"
          :key="doc.path"
          :to="doc.path"
          class="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all"
        >
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors"
            :class="doc.iconBg"
          >
            <component :is="doc.icon" class="w-6 h-6" :class="doc.iconColor" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {{ doc.name }}
          </h2>
          <p class="text-sm text-gray-600">{{ doc.description }}</p>
        </NuxtLink>
      </div>

      <div class="mt-12 text-center">
        <p class="text-sm text-gray-500">
          Raw OpenAPI JSON:
          <a href="/api/openapi.json" target="_blank" class="text-primary-600 hover:underline">
            /api/openapi.json
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileCode, Zap, Layers } from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
})

const docOptions = [
  {
    name: 'Swagger UI',
    path: '/docs/swagger',
    description: 'Classic OpenAPI documentation with try-it-out functionality',
    icon: FileCode,
    iconBg: 'bg-green-100 group-hover:bg-green-200',
    iconColor: 'text-green-600',
  },
  {
    name: 'Scalar',
    path: '/docs/scalar',
    description: 'Modern, beautiful API reference with dark mode support',
    icon: Zap,
    iconBg: 'bg-purple-100 group-hover:bg-purple-200',
    iconColor: 'text-purple-600',
  },
  {
    name: 'Stoplight Elements',
    path: '/docs/stoplight',
    description: 'Interactive API documentation with sidebar navigation',
    icon: Layers,
    iconBg: 'bg-blue-100 group-hover:bg-blue-200',
    iconColor: 'text-blue-600',
  },
]
</script>
