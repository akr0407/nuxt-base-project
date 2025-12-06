<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <component :is="icons.Layers" class="w-5 h-5 text-white" />
          </div>
          <span class="font-semibold text-gray-900">{{ appName }}</span>
        </NuxtLink>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center gap-6">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            active-class="text-primary-600"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- User Menu -->
        <div class="flex items-center gap-4">
          <template v-if="authStore.isAuthenticated">
            <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
              <n-button quaternary class="!px-2">
                <div class="flex items-center gap-2">
                  <n-avatar :size="32" round>
                    {{ userInitials }}
                  </n-avatar>
                  <span class="hidden sm:inline text-sm font-medium text-gray-700">
                    {{ authStore.user?.name || authStore.user?.email }}
                  </span>
                  <component :is="icons.ChevronDown" class="w-4 h-4 text-gray-500" />
                </div>
              </n-button>
            </n-dropdown>
          </template>
          <template v-else>
            <NuxtLink to="/login">
              <n-button quaternary>Login</n-button>
            </NuxtLink>
            <NuxtLink to="/register">
              <n-button type="primary">Register</n-button>
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { NButton, NDropdown, NAvatar } from 'naive-ui'
import { Layers, ChevronDown, User, LogOut, Settings } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const icons = { Layers, ChevronDown, User, LogOut, Settings }

const authStore = useAuthStore()
const config = useRuntimeConfig()
const appName = config.public.appName || 'Nuxt Base'

const navItems = computed(() => {
  const items = [
    { path: '/', label: 'Home' },
    { path: '/docs', label: 'API Docs' },
  ]

  if (authStore.isAuthenticated && authStore.hasPermission('users:read')) {
    items.push({ path: '/admin/users', label: 'Users' })
  }

  return items
})

const userInitials = computed(() => {
  const name = authStore.user?.name || authStore.user?.email || ''
  return name.substring(0, 2).toUpperCase()
})

const userMenuOptions = [
  {
    label: 'Profile',
    key: 'profile',
    icon: () => h(User, { size: 16 }),
  },
  {
    label: 'Settings',
    key: 'settings',
    icon: () => h(Settings, { size: 16 }),
  },
  {
    type: 'divider',
    key: 'd1',
  },
  {
    label: 'Logout',
    key: 'logout',
    icon: () => h(LogOut, { size: 16 }),
  },
]

function handleUserMenuSelect(key: string) {
  if (key === 'logout') {
    authStore.logout()
  }
}
</script>
