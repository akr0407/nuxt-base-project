import { defineStore } from 'pinia'

// localStorage key for persisting theme settings
const THEME_STORAGE_KEY = 'nuxt-base-theme-settings'

export interface ThemeSettings {
  primaryColor: string
  primaryColorHover?: string
  primaryColorPressed?: string
  secondaryColor: string
  sidebarCollapsed: boolean
  darkMode: boolean
}

export interface ThemeTemplate {
  id: string
  name: string
  settings: ThemeSettings
  isDefault?: boolean
  createdAt?: string
}

interface ThemeState {
  settings: ThemeSettings
  templates: ThemeTemplate[]
  loading: boolean
  isHydrated: boolean
}

// Default theme settings
const defaultSettings: ThemeSettings = {
  primaryColor: '#0ea5e9',
  primaryColorHover: '#0284c7',
  primaryColorPressed: '#0369a1',
  secondaryColor: '#6366f1',
  sidebarCollapsed: false,
  darkMode: false,
}

// Color utilities
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt))
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt))
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

// Helper to load settings from localStorage
function loadFromStorage(): Partial<ThemeSettings> | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Invalid JSON, ignore
  }
  return null
}

// Helper to save settings to localStorage
function saveToStorage(settings: ThemeSettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Storage full or unavailable, ignore
  }
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    settings: { ...defaultSettings },
    templates: [],
    loading: false,
    isHydrated: false,
  }),

  getters: {
    // CSS variables for custom styling (works with Tailwind)
    cssVariables(): Record<string, string> {
      const primary = this.settings.primaryColor
      const secondary = this.settings.secondaryColor
      return {
        '--primary-color': primary,
        '--primary-color-hover': this.settings.primaryColorHover || adjustColor(primary, -10),
        '--primary-color-pressed': this.settings.primaryColorPressed || adjustColor(primary, -20),
        '--secondary-color': secondary,
      }
    },
  },

  actions: {
    // Initialize theme from localStorage (called on client-side hydration)
    hydrateFromStorage() {
      if (this.isHydrated) return
      const stored = loadFromStorage()
      if (stored) {
        this.settings = { ...this.settings, ...stored }
      }
      this.isHydrated = true
    },

    async fetchSettings() {
      try {
        const { $api } = useNuxtApp()
        const response = await $api<{ data: ThemeSettings }>('/api/settings/theme')
        if (response.data) {
          this.settings = { ...this.settings, ...response.data }
          saveToStorage(this.settings)
        }
      } catch {
        // Use defaults or stored settings
      }
    },

    async fetchTemplates() {
      try {
        const { $api } = useNuxtApp()
        const response = await $api<{ data: ThemeTemplate[] }>('/api/settings/theme-templates')
        if (response.data) {
          this.templates = response.data
        }
      } catch {
        // Use defaults
      }
    },

    async updateSettings(settings: Partial<ThemeSettings>) {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const newSettings = { ...this.settings, ...settings }
        const response = await $api<{ data: ThemeSettings }>('/api/settings/theme', {
          method: 'PUT',
          body: newSettings,
        })
        if (response.data) {
          this.settings = { ...this.settings, ...response.data }
          saveToStorage(this.settings)
        }
        return true
      } catch {
        return false
      } finally {
        this.loading = false
      }
    },

    async saveTemplate(name: string): Promise<ThemeTemplate | null> {
      try {
        const { $api } = useNuxtApp()
        const response = await $api<{ data: ThemeTemplate }>('/api/settings/theme-templates', {
          method: 'POST',
          body: { name, settings: this.settings },
        })
        if (response.data) {
          this.templates.push(response.data)
          return response.data
        }
        return null
      } catch {
        return null
      }
    },

    async deleteTemplate(id: string): Promise<boolean> {
      try {
        const { $api } = useNuxtApp()
        await $api(`/api/settings/theme-templates/${id}`, {
          method: 'DELETE',
        })
        this.templates = this.templates.filter((t) => t.id !== id)
        return true
      } catch {
        return false
      }
    },

    applyTemplate(template: ThemeTemplate) {
      this.settings = { ...this.settings, ...template.settings }
      saveToStorage(this.settings)
    },

    setDarkMode(dark: boolean) {
      this.settings.darkMode = dark
      saveToStorage(this.settings)
    },

    setPrimaryColor(color: string) {
      this.settings.primaryColor = color
      this.settings.primaryColorHover = adjustColor(color, -10)
      this.settings.primaryColorPressed = adjustColor(color, -20)
      saveToStorage(this.settings)
    },

    setSecondaryColor(color: string) {
      this.settings.secondaryColor = color
      saveToStorage(this.settings)
    },

    setSidebarCollapsed(collapsed: boolean) {
      this.settings.sidebarCollapsed = collapsed
      saveToStorage(this.settings)
    },

    toggleDarkMode() {
      this.settings.darkMode = !this.settings.darkMode
      saveToStorage(this.settings)
    },
  },
})
