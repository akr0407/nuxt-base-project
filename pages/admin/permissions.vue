<template>
  <div class="p-6 max-w-4xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Permissions</h1>
      <p class="text-muted-foreground">View available system permissions</p>
    </div>

    <!-- Permissions Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading">
              <TableCell :colspan="2" class="text-center py-8 text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="permissions.length === 0">
              <TableCell :colspan="2" class="text-center py-8 text-muted-foreground">
                No permissions found
              </TableCell>
            </TableRow>
            <TableRow v-for="permission in permissions" :key="permission.id">
              <TableCell>
                <Badge variant="secondary">{{ permission.name }}</Badge>
              </TableCell>
              <TableCell>{{ permission.description || '—' }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
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

const { $api } = useNuxtApp()

const permissions = ref<Permission[]>([])
const loading = ref(false)

async function fetchPermissions() {
  loading.value = true
  try {
    const response = await $api<{ data: Permission[] }>('/api/permissions')
    permissions.value = response.data
  } catch {
    // Handle error
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPermissions()
})
</script>
