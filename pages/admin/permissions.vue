<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Permissions</h1>
      <p class="text-gray-600">View available system permissions</p>
    </div>

    <!-- Permissions Table -->
    <n-card>
      <n-data-table
        :columns="columns"
        :data="permissions"
        :loading="loading"
        :row-key="(row) => row.id"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import {
  NCard,
  NDataTable,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

interface Permission {
  id: string
  name: string
  description: string | null
  createdAt: string
}

const message = useMessage()
const { $api } = useNuxtApp()

const permissions = ref<Permission[]>([])
const loading = ref(false)

const columns = computed<DataTableColumns<Permission>>(() => [
  { title: 'Name', key: 'name', render: (row) => h(NTag, { type: 'info' }, () => row.name) },
  { title: 'Description', key: 'description', render: (row) => row.description || '—' },
])

async function fetchPermissions() {
  loading.value = true
  try {
    const response = await $api<{ data: Permission[] }>('/api/permissions')
    permissions.value = response.data
  } catch (error: any) {
    message.error(error.data?.message || 'Failed to fetch permissions')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPermissions()
})
</script>
