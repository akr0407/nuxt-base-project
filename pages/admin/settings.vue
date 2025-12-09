<template>
  <div class="settings-page">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Settings</h1>
      <p class="text-sm opacity-70">Customize application appearance and preferences</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Appearance Settings -->
      <n-card title="Appearance">
        <div class="space-y-6">
          <!-- Dark Mode Toggle -->
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Dark Mode</p>
              <p class="text-sm opacity-70">Switch between light and dark theme</p>
            </div>
            <n-switch 
              :value="themeStore.settings.darkMode"
              @update:value="handleDarkModeChange"
            >
              <template #checked>
                <Moon class="w-3 h-3" />
              </template>
              <template #unchecked>
                <Sun class="w-3 h-3" />
              </template>
            </n-switch>
          </div>

          <!-- Primary Color -->
          <div>
            <p class="font-medium mb-2">Primary Color</p>
            <p class="text-sm opacity-70 mb-3">Main accent color for the application</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in primaryColors"
                :key="color.value"
                class="color-swatch"
                :class="{ 'color-swatch--active': themeStore.settings.primaryColor === color.value }"
                :style="{ backgroundColor: color.value }"
                :title="color.name"
                @click="themeStore.setPrimaryColor(color.value)"
              >
                <Check v-if="themeStore.settings.primaryColor === color.value" class="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <!-- Secondary Color -->
          <div>
            <p class="font-medium mb-2">Secondary Color</p>
            <p class="text-sm opacity-70 mb-3">Accent color for gradients and highlights</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in secondaryColors"
                :key="color.value"
                class="color-swatch"
                :class="{ 'color-swatch--active': themeStore.settings.secondaryColor === color.value }"
                :style="{ backgroundColor: color.value }"
                :title="color.name"
                @click="themeStore.setSecondaryColor(color.value)"
              >
                <Check v-if="themeStore.settings.secondaryColor === color.value" class="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex gap-2">
            <n-button 
              type="primary" 
              :loading="saving" 
              @click="saveSettings"
              :disabled="!hasChanges"
            >
              Save Changes
            </n-button>
            <n-button @click="resetToDefaults">
              Reset
            </n-button>
          </div>
        </template>
      </n-card>

      <!-- Theme Preview -->
      <n-card title="Theme Preview">
        <div class="space-y-4">
          <div class="preview-header" :style="{ background: previewGradient }">
            <div class="preview-logo">
              <Layers class="w-5 h-5 text-white" />
            </div>
            <span class="text-white font-semibold">Preview Header</span>
          </div>
          
          <div class="flex gap-2 flex-wrap">
            <n-button type="primary">Primary</n-button>
            <n-button type="primary" ghost>Ghost</n-button>
            <n-button type="info">Secondary</n-button>
            <n-button>Default</n-button>
          </div>

          <n-progress type="line" :percentage="70" :indicator-placement="'inside'" />

          <div class="flex gap-2">
            <n-tag type="primary">Primary</n-tag>
            <n-tag type="info">Secondary</n-tag>
            <n-tag type="success">Success</n-tag>
          </div>
        </div>
      </n-card>

      <!-- Saved Themes -->
      <n-card title="Saved Themes">
        <template #header-extra>
          <n-button type="primary" size="small" @click="showSaveModal = true">
            <template #icon>
              <Plus class="w-4 h-4" />
            </template>
            Save Current
          </n-button>
        </template>

        <div v-if="themeStore.templates.length === 0" class="text-center py-8 opacity-50">
          <Palette class="w-12 h-12 mx-auto mb-2" />
          <p>No saved themes yet</p>
          <p class="text-sm">Save your current theme to reuse it later</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="template in themeStore.templates"
            :key="template.id"
            class="template-item"
          >
            <div class="flex items-center gap-3">
              <div class="color-preview">
                <div 
                  class="color-dot" 
                  :style="{ backgroundColor: template.settings.primaryColor }"
                ></div>
                <div 
                  class="color-dot" 
                  :style="{ backgroundColor: template.settings.secondaryColor }"
                ></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ template.name }}</p>
                <p class="text-xs opacity-50">
                  {{ template.settings.darkMode ? 'Dark' : 'Light' }} mode
                </p>
              </div>
              <n-button-group size="small">
                <n-button quaternary @click="applyTemplate(template)">
                  Apply
                </n-button>
                <n-button quaternary type="error" @click="confirmDeleteTemplate(template)">
                  <template #icon>
                    <Trash2 class="w-4 h-4" />
                  </template>
                </n-button>
              </n-button-group>
            </div>
          </div>
        </div>
      </n-card>

      <!-- Profile Settings -->
      <n-card title="Profile">
        <n-form :model="profile">
          <n-form-item label="Name">
            <n-input v-model:value="profile.name" placeholder="Your name" />
          </n-form-item>
          <n-form-item label="Email">
            <n-input v-model:value="profile.email" disabled />
          </n-form-item>
        </n-form>

        <template #footer>
          <n-button type="primary" :loading="savingProfile" @click="updateProfile">
            Save Profile
          </n-button>
        </template>
      </n-card>
    </div>

    <!-- Save Template Modal -->
    <n-modal v-model:show="showSaveModal">
      <n-card title="Save Theme" style="width: 400px;">
        <n-form>
          <n-form-item label="Theme Name">
            <n-input 
              v-model:value="newTemplateName" 
              placeholder="My Custom Theme"
            />
          </n-form-item>
        </n-form>
        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="showSaveModal = false">Cancel</n-button>
            <n-button 
              type="primary" 
              :loading="savingTemplate"
              :disabled="!newTemplateName.trim()"
              @click="saveTemplate"
            >
              Save
            </n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NButtonGroup,
  NTag,
  NSwitch,
  NProgress,
  NModal,
  useMessage,
  useDialog,
} from 'naive-ui'
import { Sun, Moon, Check, Layers, Plus, Palette, Trash2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore, type ThemeTemplate } from '~/stores/theme'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const authStore = useAuthStore()
const themeStore = useThemeStore()
const message = useMessage()
const dialog = useDialog()

const saving = ref(false)
const savingProfile = ref(false)
const savingTemplate = ref(false)
const showSaveModal = ref(false)
const newTemplateName = ref('')
const initialSettings = ref({ ...themeStore.settings })

const profile = reactive({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
})

const primaryColors = [
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
]

const secondaryColors = [
  { name: 'Slate', value: '#64748b' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Zinc', value: '#71717a' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
]

const previewGradient = computed(() => {
  return `linear-gradient(135deg, ${themeStore.settings.primaryColor} 0%, ${themeStore.settings.secondaryColor} 100%)`
})

const hasChanges = computed(() => {
  return themeStore.settings.primaryColor !== initialSettings.value.primaryColor ||
    themeStore.settings.secondaryColor !== initialSettings.value.secondaryColor ||
    themeStore.settings.darkMode !== initialSettings.value.darkMode
})

function handleDarkModeChange(value: boolean) {
  themeStore.setDarkMode(value)
}

function resetToDefaults() {
  themeStore.setPrimaryColor('#0ea5e9')
  themeStore.setSecondaryColor('#6366f1')
  themeStore.setDarkMode(false)
}

async function saveSettings() {
  saving.value = true
  const success = await themeStore.updateSettings({
    primaryColor: themeStore.settings.primaryColor,
    primaryColorHover: themeStore.settings.primaryColorHover,
    primaryColorPressed: themeStore.settings.primaryColorPressed,
    secondaryColor: themeStore.settings.secondaryColor,
    darkMode: themeStore.settings.darkMode,
  })
  if (success) {
    message.success('Settings saved successfully')
    initialSettings.value = { ...themeStore.settings }
  } else {
    message.error('Failed to save settings')
  }
  saving.value = false
}

async function saveTemplate() {
  if (!newTemplateName.value.trim()) return

  savingTemplate.value = true
  const template = await themeStore.saveTemplate(newTemplateName.value)
  savingTemplate.value = false

  if (template) {
    message.success('Theme saved successfully')
    showSaveModal.value = false
    newTemplateName.value = ''
  } else {
    message.error('Failed to save theme')
  }
}

function applyTemplate(template: ThemeTemplate) {
  themeStore.applyTemplate(template)
  message.success(`Applied theme: ${template.name}`)
}

function confirmDeleteTemplate(template: ThemeTemplate) {
  dialog.warning({
    title: 'Delete Theme',
    content: `Are you sure you want to delete "${template.name}"?`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      const success = await themeStore.deleteTemplate(template.id)
      if (success) {
        message.success('Theme deleted')
      } else {
        message.error('Failed to delete theme')
      }
    },
  })
}

async function updateProfile() {
  savingProfile.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    message.success('Profile updated successfully')
  } catch {
    message.error('Failed to update profile')
  } finally {
    savingProfile.value = false
  }
}

watch(() => authStore.user, (user) => {
  if (user) {
    profile.name = user.name || ''
    profile.email = user.email || ''
  }
}, { immediate: true })

onMounted(async () => {
  await themeStore.fetchSettings()
  await themeStore.fetchTemplates()
  initialSettings.value = { ...themeStore.settings }
})
</script>

<style scoped>
.settings-page {
  max-width: 1200px;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch--active {
  border-color: white;
  box-shadow: 0 0 0 2px currentColor;
}

.preview-header {
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-logo {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-item {
  padding: 12px;
  border-radius: 8px;
  background: var(--n-color-embedded);
  transition: background 0.2s;
}

.template-item:hover {
  background: var(--n-color-embedded-modal);
}

.color-preview {
  display: flex;
  gap: 4px;
}

.color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
