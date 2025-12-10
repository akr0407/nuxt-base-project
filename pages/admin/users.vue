<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">User Management</h1>
        <p class="text-muted-foreground">Manage users and their roles</p>
      </div>
      <Button v-if="authStore.hasPermission('users:create')" @click="openCreateModal">
        <UserPlus class="w-5 h-5 mr-2" />
        Add User
      </Button>
    </div>

    <!-- Filters -->
    <Card class="mb-6">
      <CardContent class="pt-6">
        <div class="flex gap-4">
          <div class="relative max-w-xs">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              v-model="search"
              placeholder="Search users..."
              class="pl-9"
              @input="debouncedFetch"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Users Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading">
              <TableCell :colspan="5" class="text-center py-8 text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="users.length === 0">
              <TableCell :colspan="5" class="text-center py-8 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
            <TableRow v-for="user in users" :key="user.id">
              <TableCell>{{ user.email }}</TableCell>
              <TableCell>{{ user.name || '—' }}</TableCell>
              <TableCell>
                <div v-if="user.roles?.length" class="flex flex-wrap gap-1">
                  <Badge v-for="role in user.roles" :key="role.id" variant="secondary">
                    {{ role.name }}
                  </Badge>
                </div>
                <span v-else class="text-muted-foreground">—</span>
              </TableCell>
              <TableCell>
                <Badge :variant="user.isActive ? 'default' : 'destructive'">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex gap-1">
                  <Button
                    v-if="authStore.hasPermission('users:update')"
                    variant="ghost"
                    size="icon"
                    @click="openEditModal(user)"
                  >
                    <Pencil class="w-4 h-4" />
                  </Button>
                  <Button
                    v-if="authStore.hasPermission('users:delete')"
                    variant="ghost"
                    size="icon"
                    class="text-destructive"
                    @click="confirmDelete(user)"
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

    <!-- Pagination -->
    <div v-if="total > pageSize" class="flex justify-center gap-2 mt-4">
      <Button variant="outline" size="sm" :disabled="page <= 1" @click="handlePageChange(page - 1)">
        Previous
      </Button>
      <span class="flex items-center px-4 text-sm text-muted-foreground">
        Page {{ page }} of {{ Math.ceil(total / pageSize) }}
      </span>
      <Button
        variant="outline"
        size="sm"
        :disabled="page >= Math.ceil(total / pageSize)"
        @click="handlePageChange(page + 1)"
      >
        Next
      </Button>
    </div>

    <!-- Create/Edit Modal -->
    <Dialog v-model:open="showModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editingUser ? 'Edit User' : 'Create User' }}</DialogTitle>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="handleSave">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="user@example.com"
              required
            />
          </div>
          <div v-if="!editingUser" class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Password"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input id="name" v-model="form.name" placeholder="Full name" />
          </div>
          <div class="space-y-2">
            <Label>Roles</Label>
            <div class="flex flex-wrap gap-2">
              <div v-for="role in roles" :key="role.id" class="flex items-center space-x-2">
                <Checkbox
                  :id="`role-${role.id}`"
                  :checked="form.roleIds.includes(role.id)"
                  @update:checked="toggleRole(role.id, $event)"
                />
                <Label :for="`role-${role.id}`" class="text-sm font-normal">{{ role.name }}</Label>
              </div>
            </div>
          </div>
          <div v-if="editingUser" class="flex items-center space-x-2">
            <Switch :checked="form.isActive" @update:checked="form.isActive = $event" />
            <Label>Active</Label>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" @click="showModal = false">Cancel</Button>
          <Button :disabled="saving" @click="handleSave">
            <span v-if="saving" class="mr-2 animate-spin">⏳</span>
            {{ editingUser ? 'Update' : 'Create' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ userToDelete?.email }}"?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false">Cancel</Button>
          <Button variant="destructive" @click="handleDelete">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { UserPlus, Search, Pencil, Trash2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

interface User {
  id: string
  email: string
  name: string | null
  isActive: boolean
  createdAt: string
  roles: { id: string; name: string }[]
}

interface Role {
  id: string
  name: string
}

const authStore = useAuthStore()
const { $api } = useNuxtApp()

const users = ref<User[]>([])
const roles = ref<Role[]>([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const total = ref(0)
const pageSize = 10

const showModal = ref(false)
const showDeleteDialog = ref(false)
const userToDelete = ref<User | null>(null)
const editingUser = ref<User | null>(null)
const saving = ref(false)

const form = reactive({
  email: '',
  password: '',
  name: '',
  roleIds: [] as string[],
  isActive: true,
})

function toggleRole(id: string, checked: boolean) {
  if (checked) {
    if (!form.roleIds.includes(id)) form.roleIds.push(id)
  } else {
    form.roleIds = form.roleIds.filter((r) => r !== id)
  }
}

async function fetchUsers() {
  loading.value = true
  try {
    const response = await $api<{
      data: User[]
      pagination: { total: number }
    }>('/api/users', {
      query: { page: page.value, limit: pageSize, search: search.value },
    })
    users.value = response.data
    total.value = response.pagination.total
  } catch {
    // Handle error
  } finally {
    loading.value = false
  }
}

async function fetchRoles() {
  try {
    const response = await $api<{ data: Role[] }>('/api/roles', {
      query: { limit: 100 },
    })
    roles.value = response.data
  } catch {
    // Ignore
  }
}

const debouncedFetch = useDebounceFn(() => {
  page.value = 1
  fetchUsers()
}, 300)

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchUsers()
}

function openCreateModal() {
  editingUser.value = null
  form.email = ''
  form.password = ''
  form.name = ''
  form.roleIds = []
  form.isActive = true
  showModal.value = true
}

function openEditModal(user: User) {
  editingUser.value = user
  form.email = user.email
  form.password = ''
  form.name = user.name || ''
  form.roleIds = user.roles.map((r) => r.id)
  form.isActive = user.isActive
  showModal.value = true
}

function confirmDelete(user: User) {
  userToDelete.value = user
  showDeleteDialog.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editingUser.value) {
      await $api(`/api/users/${editingUser.value.id}`, {
        method: 'PUT',
        body: {
          email: form.email,
          name: form.name || null,
          roleIds: form.roleIds,
          isActive: form.isActive,
        },
      })
    } else {
      await $api('/api/users', {
        method: 'POST',
        body: {
          email: form.email,
          password: form.password,
          name: form.name || undefined,
          roleIds: form.roleIds,
        },
      })
    }
    showModal.value = false
    fetchUsers()
  } catch {
    // Handle error
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!userToDelete.value) return
  try {
    await $api(`/api/users/${userToDelete.value.id}`, { method: 'DELETE' })
    showDeleteDialog.value = false
    userToDelete.value = null
    fetchUsers()
  } catch {
    // Handle error
  }
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>
