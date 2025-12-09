<template>
  <n-card title="Color Picker" class="color-picker-card">
    <div class="space-y-4">
      <div>
        <p class="font-medium mb-2">{{ label }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ description }}</p>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="color in presetColors"
            :key="color.value"
            class="color-swatch"
            :class="{ 'color-swatch--active': modelValue === color.value }"
            :style="{ backgroundColor: color.value }"
            :title="color.name"
            @click="$emit('update:modelValue', color.value)"
          >
            <Check v-if="modelValue === color.value" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Custom color:</p>
        <div class="flex gap-2">
          <n-input
            v-model:value="customColor"
            placeholder="#0ea5e9"
            class="max-w-32"
          />
          <n-button 
            type="primary" 
            @click="applyCustomColor"
            :disabled="!isValidHex"
          >
            Apply
          </n-button>
        </div>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NInput, NButton } from 'naive-ui'
import { Check } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  label: string
  description: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const customColor = ref('')

const presetColors = [
  { name: 'Sky Blue', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Slate', value: '#64748b' },
]

const isValidHex = computed(() => /^#[0-9A-Fa-f]{6}$/.test(customColor.value))

function applyCustomColor() {
  if (isValidHex.value) {
    emit('update:modelValue', customColor.value)
    customColor.value = ''
  }
}
</script>

<style scoped>
.color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch--active {
  border-color: currentColor;
  box-shadow: 0 0 0 2px white, 0 0 0 4px currentColor;
}
</style>
