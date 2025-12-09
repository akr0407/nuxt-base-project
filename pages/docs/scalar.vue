<template>
  <div class="docs-page">
    <n-card class="docs-card">
      <ClientOnly>
        <div id="scalar-root"></div>
        <template #fallback>
          <div class="flex items-center justify-center h-96">
            <div class="animate-pulse text-gray-400">Loading Scalar API Reference...</div>
          </div>
        </template>
      </ClientOnly>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { NCard } from 'naive-ui'

definePageMeta({
  layout: 'default',
})

onMounted(async () => {
  // Load Scalar CSS
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest/dist/style.css'
  document.head.appendChild(link)

  // Load Scalar script
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest/dist/browser/standalone.min.js'
  script.onload = () => {
    // @ts-expect-error - Scalar global
    if (window.Scalar) {
      const container = document.getElementById('scalar-root')
      if (container) {
        // @ts-expect-error - Scalar global
        window.Scalar.createApiReference(container, {
          spec: {
            url: '/api/openapi.json',
          },
          theme: 'default',
        })
      }
    }
  }
  document.body.appendChild(script)
})
</script>

<style scoped>
.docs-page {
  padding: 24px;
}

.docs-card {
  border-radius: 12px;
  overflow: hidden;
}

:deep(#scalar-root) {
  min-height: 600px;
}
</style>
