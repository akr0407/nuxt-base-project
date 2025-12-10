<template>
  <div class="settings-page max-w-5xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Settings</h1>
      <p class="text-sm text-muted-foreground">Customize application appearance and preferences</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Appearance Settings -->
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Dark Mode Toggle -->
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Dark Mode</p>
              <p class="text-sm text-muted-foreground">Switch between light and dark theme</p>
            </div>
            <Switch
              :checked="themeStore.settings.darkMode"
              @update:checked="handleDarkModeChange"
            />
          </div>

          <!-- Primary Color -->
          <div>
            <p class="font-medium mb-2">Primary Color</p>
            <p class="text-sm text-muted-foreground mb-3">Main accent color for the application</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in primaryColors"
                :key="color.value"
                class="color-swatch"
                :class="{
                  'color-swatch--active': themeStore.settings.primaryColor === color.value,
                }"
                :style="{ backgroundColor: color.value }"
                :title="color.name"
                @click="themeStore.setPrimaryColor(color.value)"
              >
                <Check
                  v-if="themeStore.settings.primaryColor === color.value"
                  class="w-4 h-4 text-white"
                />
              </button>
            </div>
          </div>

          <!-- Secondary Color -->
          <div>
            <p class="font-medium mb-2">Secondary Color</p>
            <p class="text-sm text-muted-foreground mb-3">
              Accent color for gradients and highlights
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in secondaryColors"
                :key="color.value"
                class="color-swatch"
                :class="{
                  'color-swatch--active': themeStore.settings.secondaryColor === color.value,
                }"
                :style="{ backgroundColor: color.value }"
                :title="color.name"
                @click="themeStore.setSecondaryColor(color.value)"
              >
                <Check
                  v-if="themeStore.settings.secondaryColor === color.value"
                  class="w-4 h-4 text-white"
                />
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter class="gap-2">
          <Button :disabled="!hasChanges || saving" @click="saveSettings">
            <span v-if="saving" class="mr-2 animate-spin">⏳</span>
            Save Changes
          </Button>
          <Button variant="outline" @click="resetToDefaults"> Reset </Button>
        </CardFooter>
      </Card>

      <!-- Theme Preview -->
      <Card>
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="preview-header" :style="{ background: previewGradient }">
            <div class="preview-logo">
              <Layers class="w-5 h-5 text-white" />
            </div>
            <span class="text-white font-semibold">Preview Header</span>
          </div>

          <div class="flex gap-2 flex-wrap">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>

          <Progress :model-value="70" class="w-full" />

          <div class="flex gap-2">
            <Badge>Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </CardContent>
      </Card>

      <!-- Saved Themes -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle>Saved Themes</CardTitle>
          <Button size="sm" @click="showSaveModal = true">
            <Plus class="w-4 h-4 mr-2" />
            Save Current
          </Button>
        </CardHeader>
        <CardContent>
          <div
            v-if="themeStore.templates.length === 0"
            class="text-center py-8 text-muted-foreground"
          >
            <Palette class="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No saved themes yet</p>
            <p class="text-sm">Save your current theme to reuse it later</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="template in themeStore.templates"
              :key="template.id"
              class="template-item p-3 rounded-lg border flex items-center gap-3"
            >
              <div class="color-preview flex gap-1">
                <div
                  class="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                  :style="{ backgroundColor: template.settings.primaryColor }"
                />
                <div
                  class="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                  :style="{ backgroundColor: template.settings.secondaryColor }"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ template.name }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ template.settings.darkMode ? 'Dark' : 'Light' }} mode
                </p>
              </div>
              <div class="flex gap-1">
                <Button variant="ghost" size="sm" @click="applyTemplate(template)"> Apply </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-destructive"
                  @click="confirmDeleteTemplate(template)"
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Profile Settings -->
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input id="name" v-model="profile.name" placeholder="Your name" />
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="profile.email" disabled />
          </div>
        </CardContent>
        <CardFooter>
          <Button :disabled="savingProfile" @click="updateProfile">
            <span v-if="savingProfile" class="mr-2 animate-spin">⏳</span>
            Save Profile
          </Button>
        </CardFooter>
      </Card>
    </div>

    <!-- Save Template Dialog -->
    <Dialog v-model:open="showSaveModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Theme</DialogTitle>
          <DialogDescription> Save your current theme settings for later use. </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="themeName">Theme Name</Label>
            <Input id="themeName" v-model="newTemplateName" placeholder="My Custom Theme" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showSaveModal = false">Cancel</Button>
          <Button :disabled="!newTemplateName.trim() || savingTemplate" @click="saveTemplate">
            <span v-if="savingTemplate" class="mr-2 animate-spin">⏳</span>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Theme</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ templateToDelete?.name }}"?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false">Cancel</Button>
          <Button variant="destructive" @click="deleteTemplate"> Delete </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Check, Layers, Plus, Palette, Trash2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore, type ThemeTemplate } from '~/stores/theme'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const authStore = useAuthStore()
const themeStore = useThemeStore()

const saving = ref(false)
const savingProfile = ref(false)
const savingTemplate = ref(false)
const showSaveModal = ref(false)
const showDeleteDialog = ref(false)
const templateToDelete = ref<ThemeTemplate | null>(null)
const newTemplateName = ref('')
const initialSettings = ref({ ...themeStore.settings })
const successMessage = ref('')

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
  return (
    themeStore.settings.primaryColor !== initialSettings.value.primaryColor ||
    themeStore.settings.secondaryColor !== initialSettings.value.secondaryColor ||
    themeStore.settings.darkMode !== initialSettings.value.darkMode
  )
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
    successMessage.value = 'Settings saved successfully'
    initialSettings.value = { ...themeStore.settings }
  }
  saving.value = false
}

async function saveTemplate() {
  if (!newTemplateName.value.trim()) return

  savingTemplate.value = true
  const template = await themeStore.saveTemplate(newTemplateName.value)
  savingTemplate.value = false

  if (template) {
    showSaveModal.value = false
    newTemplateName.value = ''
  }
}

function applyTemplate(template: ThemeTemplate) {
  themeStore.applyTemplate(template)
}

function confirmDeleteTemplate(template: ThemeTemplate) {
  templateToDelete.value = template
  showDeleteDialog.value = true
}

async function deleteTemplate() {
  if (!templateToDelete.value) return
  await themeStore.deleteTemplate(templateToDelete.value.id)
  showDeleteDialog.value = false
  templateToDelete.value = null
}

async function updateProfile() {
  savingProfile.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    // Profile update logic here
  } finally {
    savingProfile.value = false
  }
}

watch(
  () => authStore.user,
  (user) => {
    if (user) {
      profile.name = user.name || ''
      profile.email = user.email || ''
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await themeStore.fetchSettings()
  await themeStore.fetchTemplates()
  initialSettings.value = { ...themeStore.settings }
})
</script>

<style scoped>
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
</style>
