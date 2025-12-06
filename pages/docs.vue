<template>
  <div class="min-h-screen bg-white">
    <div id="swagger-ui"></div>
  </div>
</template>

<script setup lang="ts">
import 'swagger-ui-dist/swagger-ui.css'

definePageMeta({
  middleware: ['auth'],
})

onMounted(async () => {
  // Dynamically import SwaggerUI to avoid SSR issues
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

<style>
/* Customize Swagger UI appearance */
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
