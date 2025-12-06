<template>
  <div class="min-h-screen flex flex-col">
    <ClientOnly>
      <n-config-provider :theme="null">
        <n-message-provider>
          <n-dialog-provider>
            <n-notification-provider>
              <AppHeader />
              <main class="flex-1">
                <slot />
              </main>
            </n-notification-provider>
          </n-dialog-provider>
        </n-message-provider>
      </n-config-provider>
      <template #fallback>
        <div class="bg-white border-b border-gray-200 h-16"></div>
        <main class="flex-1">
          <div class="flex items-center justify-center h-64">
            <div class="animate-pulse text-gray-400">Loading...</div>
          </div>
        </main>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
} from 'naive-ui'
</script>
