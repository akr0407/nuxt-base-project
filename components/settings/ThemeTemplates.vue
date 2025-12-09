<template>
  <n-card title="Saved Themes">
    <template #header-extra>
      <n-button type="primary" size="small" @click="showSaveModal = true">
        <template #icon>
          <Plus class="w-4 h-4" />
        </template>
        Save Current
      </n-button>
    </template>

    <div v-if="templates.length === 0" class="text-center py-8 text-gray-500">
      <Palette class="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p>No saved themes yet</p>
      <p class="text-sm">Save your current theme to reuse it later</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="template in templates"
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
          <div class="flex-1">
            <p class="font-medium">{{ template.name }}</p>
            <p class="text-xs text-gray-500">
              {{ template.settings.darkMode ? 'Dark' : 'Light' }} mode
            </p>
          </div>
          <n-button-group size="small">
            <n-button quaternary @click="$emit('apply', template)">
              Apply
            </n-button>
            <n-button quaternary type="error" @click="confirmDelete(template)">
              <template #icon>
                <Trash2 class="w-4 h-4" />
              </template>
            </n-button>
          </n-button-group>
        </div>
      </div>
    </div>

    <!-- Save Modal -->
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
              :loading="saving"
              :disabled="!newTemplateName.trim()"
              @click="saveTemplate"
            >
              Save
            </n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </n-card>
</template>

<script setup lang="ts">
import {
  NCard,
  NButton,
  NButtonGroup,
  NModal,
  NForm,
  NFormItem,
  NInput,
  useDialog,
  useMessage,
} from 'naive-ui'
import { Plus, Palette, Trash2 } from 'lucide-vue-next'
import type { ThemeTemplate } from '~/stores/theme'

const props = defineProps<{
  templates: ThemeTemplate[]
}>()

const emit = defineEmits<{
  (e: 'apply', template: ThemeTemplate): void
  (e: 'save', name: string): Promise<boolean>
  (e: 'delete', id: string): Promise<boolean>
}>()

const dialog = useDialog()
const message = useMessage()

const showSaveModal = ref(false)
const newTemplateName = ref('')
const saving = ref(false)

async function saveTemplate() {
  if (!newTemplateName.value.trim()) return

  saving.value = true
  const success = await emit('save', newTemplateName.value)
  saving.value = false

  if (success !== false) {
    message.success('Theme saved successfully')
    showSaveModal.value = false
    newTemplateName.value = ''
  } else {
    message.error('Failed to save theme')
  }
}

function confirmDelete(template: ThemeTemplate) {
  dialog.warning({
    title: 'Delete Theme',
    content: `Are you sure you want to delete "${template.name}"?`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      const success = await emit('delete', template.id)
      if (success !== false) {
        message.success('Theme deleted')
      } else {
        message.error('Failed to delete theme')
      }
    },
  })
}
</script>

<style scoped>
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
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
