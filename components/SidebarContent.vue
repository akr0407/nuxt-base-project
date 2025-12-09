<template>
  <div class="sidebar h-full flex flex-col" :class="{ 'sidebar--collapsed': collapsed, 'sidebar--dark': dark }">
    <!-- Logo -->
    <div class="sidebar-header" :class="{ 'sidebar-header--collapsed': collapsed }">
      <NuxtLink to="/" class="logo-link" @click="$emit('navigate')">
        <div class="logo-icon" :style="{ background: primaryGradient }">
          <Layers class="w-5 h-5 text-white" />
        </div>
        <Transition name="fade">
          <span v-if="!collapsed" class="logo-text">{{ appName }}</span>
        </Transition>
      </NuxtLink>
    </div>

    <!-- Navigation -->
    <n-scrollbar class="flex-1">
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="20"
        :options="menuOptions"
        :value="activeKey"
        :render-label="renderMenuLabel"
        :inverted="dark"
        @update:value="handleMenuSelect"
      />
    </n-scrollbar>

    <!-- Footer -->
    <div class="sidebar-footer" v-if="!collapsed">
      <div class="version-info">
        <span class="text-xs opacity-50">v1.0.0</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NMenu, NScrollbar } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import {
  Layers,
  Home,
  FileCode,
  Users,
  Shield,
  Key,
  Settings,
  LayoutDashboard,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'

const props = defineProps<{
  collapsed: boolean
  dark?: boolean
}>()

const emit = defineEmits<{
  (e: 'navigate'): void
}>()

const authStore = useAuthStore()
const themeStore = useThemeStore()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const appName = config.public.appName || 'Nuxt Base'

const primaryGradient = computed(() => {
  const primary = themeStore.settings.primaryColor
  const secondary = themeStore.settings.secondaryColor || themeStore.settings.primaryColorPressed
  return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`
})

const activeKey = computed(() => {
  if (route.path === '/') return 'home'
  if (route.path.startsWith('/docs')) return 'docs'
  if (route.path.startsWith('/admin/users')) return 'admin-users'
  if (route.path.startsWith('/admin/roles')) return 'admin-roles'
  if (route.path.startsWith('/admin/permissions')) return 'admin-permissions'
  if (route.path.startsWith('/admin/settings')) return 'admin-settings'
  return route.path
})

const menuOptions = computed<MenuOption[]>(() => {
  const options: MenuOption[] = [
    {
      label: 'Home',
      key: 'home',
      icon: () => h(Home, { size: 18 }),
    },
    {
      label: 'API Docs',
      key: 'docs',
      icon: () => h(FileCode, { size: 18 }),
    },
  ]

  // Admin section (only if authenticated with permissions)
  if (authStore.isAuthenticated) {
    const adminChildren: MenuOption[] = []

    if (authStore.hasPermission('users:read')) {
      adminChildren.push({
        label: 'Users',
        key: 'admin-users',
        icon: () => h(Users, { size: 18 }),
      })
    }

    if (authStore.hasPermission('roles:read')) {
      adminChildren.push({
        label: 'Roles',
        key: 'admin-roles',
        icon: () => h(Shield, { size: 18 }),
      })
    }

    if (authStore.hasPermission('permissions:read')) {
      adminChildren.push({
        label: 'Permissions',
        key: 'admin-permissions',
        icon: () => h(Key, { size: 18 }),
      })
    }

    adminChildren.push({
      label: 'Settings',
      key: 'admin-settings',
      icon: () => h(Settings, { size: 18 }),
    })

    if (adminChildren.length > 0) {
      options.push({
        label: 'Administration',
        key: 'admin',
        icon: () => h(LayoutDashboard, { size: 18 }),
        children: adminChildren,
      })
    }
  }

  return options
})

function renderMenuLabel(option: MenuOption) {
  return h('span', { class: 'menu-label' }, option.label as string)
}

function handleMenuSelect(key: string) {
  const routes: Record<string, string> = {
    home: '/',
    docs: '/docs',
    'admin-users': '/admin/users',
    'admin-roles': '/admin/roles',
    'admin-permissions': '/admin/permissions',
    'admin-settings': '/admin/settings',
  }

  if (routes[key]) {
    router.push(routes[key])
    emit('navigate')
  }
}
</script>

<style scoped>
.sidebar {
  --sidebar-bg: #ffffff;
  --sidebar-border: #e5e7eb;
  --sidebar-text: #111827;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  overflow: hidden;
}

.sidebar--dark {
  --sidebar-bg: #1f2937;
  --sidebar-border: #374151;
  --sidebar-text: #f9fafb;
}

.sidebar--collapsed {
  width: 64px;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 22px;
  border-bottom: 1px solid var(--sidebar-border);
  overflow: hidden;
  transition: padding 0.2s ease;
}

.sidebar-header--collapsed {
  padding: 0 14px;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  overflow: hidden;
  transition: gap 0.2s ease;
}

.logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.logo-text {
  font-weight: 700;
  font-size: 18px;
  color: var(--sidebar-text);
  white-space: nowrap;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--sidebar-border);
}

.version-info {
  text-align: center;
  color: var(--sidebar-text);
}

/* Menu styling */
:deep(.n-menu) {
  padding: 8px 0;
}

:deep(.n-menu-item) {
  margin: 2px 0;
}

:deep(.n-menu-item-content) {
  border-radius: 8px;
}

:deep(.n-menu-item-content--selected) {
  font-weight: 500;
}

:deep(.n-menu-item-content--selected::before) {
  display: none;
}

:deep(.n-submenu-children) {
  padding-left: 8px;
}

/* Fade transition for logo text */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
