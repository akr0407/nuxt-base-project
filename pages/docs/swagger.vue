<template>
  <div class="docs-page">
    <n-card class="docs-card">
      <ClientOnly>
        <div id="swagger-ui"></div>
        <template #fallback>
          <div class="flex items-center justify-center h-96">
            <div class="animate-pulse text-gray-400">Loading Swagger UI...</div>
          </div>
        </template>
      </ClientOnly>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { NCard } from 'naive-ui'
import 'swagger-ui-dist/swagger-ui.css'

definePageMeta({
  layout: 'default',
})

onMounted(async () => {
  const SwaggerUI = (await import('swagger-ui-dist/swagger-ui-bundle')).default
  
  SwaggerUI({
    url: '/api/openapi.json',
    dom_id: '#swagger-ui',
    deepLinking: false,
    presets: [
      SwaggerUI.presets.apis,
      SwaggerUI.SwaggerUIStandalonePreset,
    ],
    layout: 'BaseLayout',
  })
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
</style>

<style>
.swagger-ui .topbar {
  display: none;
}

.swagger-ui .info {
  margin: 20px 0;
}

.swagger-ui .info .title {
  font-size: 2rem;
}
</style>
