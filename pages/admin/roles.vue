<template>
  <div class="p-6 max-w-5xl">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Roles</h1>
        <p class="text-muted-foreground">Manage roles and their permissions</p>
      </div>
      <Button v-if="authStore.hasPermission('roles:create')" @click="openCreateModal">
        <Plus class="w-5 h-5 mr-2" />
        Add Role
      </Button>
    </div>

    <!-- Roles Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[150px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead class="w-[80px]">Users</TableHead>
              <TableHead class="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading">
              <TableCell :colspan="5" class="text-center py-8 text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="roles.length === 0">
              <TableCell :colspan="5" class="text-center py-8 text-muted-foreground">
                No roles found
              </TableCell>
            </TableRow>
            <TableRow v-for="role in roles" :key="role.id">
              <TableCell class="font-medium">{{ role.name }}</TableCell>
              <TableCell>{{ role.description || '—' }}</TableCell>
              <TableCell>
                <div v-if="role.permissions?.length" class="flex flex-wrap gap-1">
                  <Badge
                    v-for="p in role.permissions"
                    :key="p.id"
                    variant="outline"
                    class="text-xs"
                  >
                    {{ p.name }}
                  </Badge>
                </div>
                <span v-else class="text-muted-foreground">—</span>
              </TableCell>
              <TableCell>{{ role.userCount }}</TableCell>
              <TableCell>
                <div class="flex gap-1">
                  <Button
                    v-if="authStore.hasPermission('roles:update')"
                    variant="ghost"
                    size="icon"
                    @click="openEditModal(role)"
                  >
                    <Pencil class="w-4 h-4" />
                  </Button>
                  <Button
                    v-if="authStore.hasPermission('roles:update') && role.name !== 'admin'"
                    variant="ghost"
                    size="icon"
                    class="text-destructive"
                    @click="confirmDelete(role)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Create/Edit Modal -->
    <Dialog v-model:open="showModal">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ editingRole ? 'Edit Role' : 'Create Role' }}</DialogTitle>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input id="name" v-model="form.name" placeholder="Role name" required />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Input id="description" v-model="form.description" placeholder="Description" />
          </div>
          <div class="space-y-2">
            <Label>Permissions</Label>
            <div class="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-2 border rounded-md">
              <div
                v-for="permission in permissions"
                :key="permission.id"
                class="flex items-start space-x-2"
              >
                <Checkbox
                  :id="`perm-${permission.id}`"
                  :checked="form.permissionIds.includes(permission.id)"
                  @update:checked="togglePermission(permission.id, $event)"
                />
                <div class="grid gap-1.5 leading-none">
                  <Label :for="`perm-${permission.id}`" class="text-sm font-medium">
                    {{ formatPermissionName(permission.name) }}
                  </Label>
                  <p v-if="permission.description" class="text-xs text-muted-foreground">
                    {{ permission.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" @click="showModal = false">Cancel</Button>
          <Button :disabled="saving" @click="handleSubmit">
            <span v-if="saving" class="mr-2 animate-spin">⏳</span>
            {{ editingRole ? 'Update' : 'Create' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ roleToDelete?.name }}"?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false">Cancel</Button>
          <Button variant="destructive" @click="deleteRole">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

interface Role {
  id: string
  name: string
  description: string | null
  permissions: { id: string; name: string }[]
  userCount: number
}

interface Permission {
  id: string
  name: string
  description?: string
}

const authStore = useAuthStore()
const { $api } = useNuxtApp()

const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const loading = ref(false)
const showModal = ref(false)
const showDeleteDialog = ref(false)
const roleToDelete = ref<Role | null>(null)
const saving = ref(false)
const editingRole = ref<Role | null>(null)

const form = reactive({
  name: '',
  description: '',
  permissionIds: [] as string[],
})

function formatPermissionName(name: string): string {
  const [resource, action] = name.split(':')
  return `${resource.charAt(0).toUpperCase() + resource.slice(1)} - ${action.charAt(0).toUpperCase() + action.slice(1)}`
}

function togglePermission(id: string, checked: boolean) {
  if (checked) {
    if (!form.permissionIds.includes(id)) form.permissionIds.push(id)
  } else {
    form.permissionIds = form.permissionIds.filter((p) => p !== id)
  }
}

function openCreateModal() {
  editingRole.value = null
  form.name = ''
  form.description = ''
  form.permissionIds = []
  showModal.value = true
}

function openEditModal(role: Role) {
  editingRole.value = role
  form.name = role.name
  form.description = role.description || ''
  form.permissionIds = role.permissions.map((p) => p.id)
  showModal.value = true
}

function confirmDelete(role: Role) {
  roleToDelete.value = role
  showDeleteDialog.value = true
}

async function fetchRoles() {
  loading.value = true
  try {
    const response = await $api<{ data: Role[] }>('/api/roles', { query: { limit: 100 } })
    roles.value = response.data
  } catch {
    // Handle error
  } finally {
    loading.value = false
  }
}

async function fetchPermissions() {
  try {
    const response = await $api<{ data: Permission[] }>('/api/permissions')
    permissions.value = response.data
  } catch {
    // Ignore
  }
}

async function handleSubmit() {
  saving.value = true
  try {
    if (editingRole.value) {
      await $api(`/api/roles/${editingRole.value.id}`, {
        method: 'PUT',
        body: form,
      })
    } else {
      await $api('/api/roles', {
        method: 'POST',
        body: form,
      })
    }
    showModal.value = false
    fetchRoles()
  } catch {
    // Handle error
  } finally {
    saving.value = false
  }
}

async function deleteRole() {
  if (!roleToDelete.value) return
  try {
    await $api(`/api/roles/${roleToDelete.value.id}`, { method: 'DELETE' })
    showDeleteDialog.value = false
    roleToDelete.value = null
    fetchRoles()
  } catch {
    // Handle error
  }
}

onMounted(() => {
  fetchRoles()
  fetchPermissions()
})
</script>
