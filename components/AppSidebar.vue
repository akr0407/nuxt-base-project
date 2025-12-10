<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Layers, Home, FileCode, Users, Shield, Key, Settings, LogIn } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const route = useRoute()
const config = useRuntimeConfig()
const appName = config.public.appName || 'Nuxt Base Project'

const primaryGradient = computed(() => {
  const primary = themeStore.settings.primaryColor
  const secondary = themeStore.settings.secondaryColor || themeStore.settings.primaryColorPressed
  return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`
})

// Main navigation items
const mainNavItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'API Docs', url: '/docs', icon: FileCode },
]

// Admin navigation items (permission-based)
const adminNavItems = computed(() => {
  const items = []
  if (authStore.hasPermission('users:read')) {
    items.push({ title: 'Users', url: '/admin/users', icon: Users })
  }
  if (authStore.hasPermission('roles:read')) {
    items.push({ title: 'Roles', url: '/admin/roles', icon: Shield })
  }
  if (authStore.hasPermission('permissions:read')) {
    items.push({ title: 'Permissions', url: '/admin/permissions', icon: Key })
  }
  items.push({ title: 'Settings', url: '/admin/settings', icon: Settings })
  return items
})

function isActive(url: string) {
  if (url === '/') return route.path === '/'
  return route.path.startsWith(url)
}
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink to="/">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground"
                :style="{ background: primaryGradient }"
              >
                <Layers class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ appName }}</span>
                <span class="truncate text-xs">Enterprise</span>
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <!-- Platform Navigation -->
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in mainNavItems" :key="item.title">
              <SidebarMenuButton as-child :is-active="isActive(item.url)">
                <NuxtLink :to="item.url">
                  <component :is="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- Administration Navigation -->
      <SidebarGroup v-if="authStore.isAuthenticated && adminNavItems.length > 0">
        <SidebarGroupLabel>Administration</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in adminNavItems" :key="item.title">
              <SidebarMenuButton as-child :is-active="isActive(item.url)">
                <NuxtLink :to="item.url">
                  <component :is="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <NavUser v-if="authStore.isAuthenticated" />
      <SidebarMenu v-else>
        <SidebarMenuItem>
          <SidebarMenuButton as-child>
            <NuxtLink to="/login">
              <LogIn class="size-4" />
              <span>Login</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
