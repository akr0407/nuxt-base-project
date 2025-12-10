<template>
  <div class="docs-page">
    <Card class="docs-card">
      <CardContent class="p-0">
        <ClientOnly>
          <div id="stoplight-root" />
          <template #fallback>
            <div class="flex items-center justify-center h-96">
              <div class="animate-pulse text-gray-400">Loading Stoplight Elements...</div>
            </div>
          </template>
        </ClientOnly>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

onMounted(async () => {
  // Load Stoplight Elements CSS
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/@stoplight/elements/styles.min.css'
  document.head.appendChild(link)

  // Load Stoplight Elements script
  const script = document.createElement('script')
  script.src = 'https://unpkg.com/@stoplight/elements/web-components.min.js'
  script.onload = () => {
    const container = document.getElementById('stoplight-root')
    if (container) {
      container.innerHTML = `
        <elements-api
          apiDescriptionUrl="/api/openapi.json"
          router="hash"
          layout="sidebar"
        />
      `
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

:deep(#stoplight-root) {
  min-height: 600px;
}

:deep(elements-api) {
  display: block;
  min-height: 600px;
}
</style>
