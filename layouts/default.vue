<template>
  <ClientOnly>
    <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
      <n-message-provider>
        <n-dialog-provider>
          <n-notification-provider>
            <div class="app-layout" :class="{ 'dark': isDarkMode }">
              <!-- Sidebar for Desktop -->
              <aside
                v-if="!isMobile"
                class="sidebar"
                :class="{ 'sidebar--collapsed': sidebarCollapsed }"
              >
                <SidebarContent :collapsed="sidebarCollapsed" :dark="isDarkMode" />
                <button class="collapse-trigger" @click="sidebarCollapsed = !sidebarCollapsed">
                  <ChevronLeft class="w-4 h-4" :class="{ 'rotate-180': sidebarCollapsed }" />
                </button>
              </aside>

              <!-- Main Area -->
              <div class="main-area" :class="{ 'main-area--sidebar-collapsed': sidebarCollapsed && !isMobile }">
                <!-- Top Header -->
                <header class="header">
                  <div class="header-content">
                    <!-- Mobile Menu Toggle -->
                    <n-button
                      v-if="isMobile"
                      quaternary
                      circle
                      @click="showMobileMenu = true"
                    >
                      <template #icon>
                        <Menu class="w-5 h-5" />
                      </template>
                    </n-button>

                    <!-- Logo (Mobile) -->
                    <NuxtLink v-if="isMobile" to="/" class="mobile-logo">
                      <div class="logo-icon" :style="{ background: primaryGradient }">
                        <Layers class="w-5 h-5 text-white" />
                      </div>
                      <span class="logo-text">{{ appName }}</span>
                    </NuxtLink>

                    <!-- Spacer -->
                    <div class="flex-1"></div>

                    <!-- Header Right -->
                    <div class="header-right">
                      <!-- Dark Mode Toggle -->
                      <n-button quaternary circle @click="themeStore.toggleDarkMode">
                        <template #icon>
                          <Moon v-if="!isDarkMode" class="w-5 h-5" />
                          <Sun v-else class="w-5 h-5" />
                        </template>
                      </n-button>

                      <template v-if="authStore.isAuthenticated">
                        <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
                          <n-button quaternary class="user-button">
                            <n-avatar :size="32" round class="user-avatar" :style="{ background: primaryGradient }">
                              {{ userInitials }}
                            </n-avatar>
                            <span class="user-name">
                              {{ authStore.user?.name || authStore.user?.email }}
                            </span>
                            <ChevronDown class="w-4 h-4 opacity-50" />
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
                </header>

                <!-- Content -->
                <main class="content-area">
                  <slot />
                </main>
              </div>
            </div>

            <!-- Mobile Drawer -->
            <n-drawer
              v-model:show="showMobileMenu"
              :width="280"
              placement="left"
              :trap-focus="true"
            >
              <n-drawer-content :body-content-style="{ padding: 0 }">
                <SidebarContent :collapsed="false" :dark="isDarkMode" @navigate="showMobileMenu = false" />
              </n-drawer-content>
            </n-drawer>
          </n-notification-provider>
        </n-dialog-provider>
      </n-message-provider>
    </n-config-provider>

    <template #fallback>
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="animate-pulse text-gray-400">Loading...</div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NButton,
  NDropdown,
  NAvatar,
  NDrawer,
  NDrawerContent,
} from 'naive-ui'
import { Menu, ChevronDown, ChevronLeft, Layers, User, LogOut, Sun, Moon } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const config = useRuntimeConfig()
const appName = config.public.appName || 'Nuxt Base'

const sidebarCollapsed = ref(false)
const showMobileMenu = ref(false)
const isMobile = ref(false)

// Theme from store
const naiveTheme = computed(() => themeStore.naiveTheme)
const themeOverrides = computed(() => themeStore.themeOverrides)
const isDarkMode = computed(() => themeStore.settings.darkMode)
const primaryGradient = computed(() => {
  const primary = themeStore.settings.primaryColor
  const secondary = themeStore.settings.secondaryColor || themeStore.settings.primaryColorPressed
  return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`
})

// Check if mobile on mount and resize
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  themeStore.fetchSettings()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

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

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  --bg-primary: #f9fafb;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

.app-layout.dark {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-tertiary: #374151;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  z-index: 100;
  transition: width 0.2s ease;
}

.sidebar--collapsed {
  width: 64px;
}

.collapse-trigger {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 101;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.collapse-trigger:hover {
  background: var(--bg-tertiary);
}

.rotate-180 {
  transform: rotate(180deg);
}

.main-area {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.2s ease;
}

.main-area--sidebar-collapsed {
  margin-left: 64px;
}

.header {
  height: 64px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 24px;
  gap: 12px;
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-button {
  padding: 4px 8px !important;
}

.user-avatar {
  flex-shrink: 0;
}

.user-name {
  margin: 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.content-area {
  flex: 1;
  padding: 24px;
  background: var(--bg-primary);
}

@media (max-width: 767px) {
  .main-area {
    margin-left: 0;
  }

  .user-name {
    display: none;
  }
}

@media (min-width: 768px) {
  .user-name {
    display: inline;
  }
}
</style>
