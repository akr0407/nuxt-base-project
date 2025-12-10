<template>
  <div :class="['min-h-screen', { dark: isDarkMode }]">
    <ClientOnly>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <!-- Header -->
          <header
            class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-background"
          >
            <div class="flex items-center gap-2 px-4">
              <SidebarTrigger class="-ml-1" />
              <Separator orientation="vertical" class="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem class="hidden md:block">
                    <BreadcrumbLink href="/"> Home </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator class="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{{ currentPageTitle }}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div class="flex-1" />

            <!-- Header Right Actions -->
            <div class="flex items-center gap-2 px-4">
              <!-- Dark Mode Toggle -->
              <Button variant="ghost" size="icon" @click="toggleDarkMode">
                <Moon v-if="!isDarkMode" class="size-5" />
                <Sun v-else class="size-5" />
              </Button>
            </div>
          </header>

          <!-- Main Content -->
          <main class="flex flex-1 flex-col gap-4 p-4 pt-4 bg-background">
            <slot />
          </main>
        </SidebarInset>
      </SidebarProvider>

      <template #fallback>
        <div class="min-h-screen flex items-center justify-center bg-background">
          <div class="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Moon, Sun } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()
const route = useRoute()

const isDarkMode = computed(() => themeStore.settings.darkMode)

// Toggle dark mode and update document class
function toggleDarkMode() {
  themeStore.toggleDarkMode()
  updateDocumentClass()
}

// Apply dark class to document html element
function updateDocumentClass() {
  if (typeof document !== 'undefined') {
    if (themeStore.settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

// Generate breadcrumb page title from route
const currentPageTitle = computed(() => {
  const path = route.path
  if (path === '/') return 'Dashboard'

  // Get the last segment of the path
  const segments = path.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1] || 'Dashboard'

  // Convert to title case
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
})

// Initialize theme on mount
onMounted(() => {
  themeStore.hydrateFromStorage()
  themeStore.fetchSettings()
  updateDocumentClass()
})

// Watch for theme changes
watch(
  () => themeStore.settings.darkMode,
  () => {
    updateDocumentClass()
  }
)
</script>
