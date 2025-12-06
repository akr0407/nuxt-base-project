<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <p class="text-gray-600">Manage users and their roles</p>
      </div>
      <n-button
        v-if="authStore.hasPermission('users:create')"
        type="primary"
        @click="openCreateModal"
      >
        <template #icon>
          <component :is="icons.UserPlus" class="w-5 h-5" />
        </template>
        Add User
      </n-button>
    </div>

    <!-- Filters -->
    <n-card class="mb-6">
      <div class="flex gap-4">
        <n-input
          v-model:value="search"
          placeholder="Search users..."
          clearable
          class="max-w-xs"
          @update:value="debouncedFetch"
        >
          <template #prefix>
            <component :is="icons.Search" class="w-4 h-4 text-gray-400" />
          </template>
        </n-input>
      </div>
    </n-card>

    <!-- Users Table -->
    <n-card>
      <n-data-table
        :columns="columns"
        :data="users"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row) => row.id"
        remote
        @update:page="handlePageChange"
      />
    </n-card>

    <!-- Create/Edit Modal -->
    <n-modal v-model:show="showModal" preset="card" :title="editingUser ? 'Edit User' : 'Create User'" style="width: 500px;">
      <n-form ref="formRef" :model="form" :rules="rules">
        <n-form-item label="Email" path="email">
          <n-input v-model:value="form.email" placeholder="user@example.com" />
        </n-form-item>
        <n-form-item v-if="!editingUser" label="Password" path="password">
          <n-input v-model:value="form.password" type="password" placeholder="Password" />
        </n-form-item>
        <n-form-item label="Name" path="name">
          <n-input v-model:value="form.name" placeholder="Full name" />
        </n-form-item>
        <n-form-item label="Roles" path="roleIds">
          <n-select
            v-model:value="form.roleIds"
            multiple
            :options="roleOptions"
            placeholder="Select roles"
          />
        </n-form-item>
        <n-form-item v-if="editingUser" label="Active" path="isActive">
          <n-switch v-model:value="form.isActive" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <n-button @click="showModal = false">Cancel</n-button>
          <n-button type="primary" :loading="saving" @click="handleSave">
            {{ editingUser ? 'Update' : 'Create' }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import {
  NButton,
  NCard,
  NInput,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NSelect,
  NSwitch,
  NTag,
  NSpace,
  NPopconfirm,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui'
import { UserPlus, Search, Pencil, Trash2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  middleware: ['auth'],
})

const icons = { UserPlus, Search, Pencil, Trash2 }

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
const message = useMessage()
const { $api } = useNuxtApp()

const users = ref<User[]>([])
const roles = ref<Role[]>([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const total = ref(0)
const pageSize = 10

const showModal = ref(false)
const editingUser = ref<User | null>(null)
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

const form = reactive({
  email: '',
  password: '',
  name: '',
  roleIds: [] as string[],
  isActive: true,
})

const rules: FormRules = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' },
  ],
  password: [
    {
      required: true,
      message: 'Password is required',
      trigger: 'blur',
      validator: (_rule, value) => {
        if (!editingUser.value && !value) {
          return new Error('Password is required')
        }
        return true
      },
    },
  ],
}

const pagination = computed(() => ({
  page: page.value,
  pageSize: pageSize,
  pageCount: Math.ceil(total.value / pageSize),
  itemCount: total.value,
}))

const roleOptions = computed(() =>
  roles.value.map((role) => ({
    label: role.name,
    value: role.id,
  }))
)

const columns = computed<DataTableColumns<User>>(() => [
  {
    title: 'Email',
    key: 'email',
  },
  {
    title: 'Name',
    key: 'name',
    render: (row) => row.name || '—',
  },
  {
    title: 'Roles',
    key: 'roles',
    render: (row) => {
      if (!row.roles?.length) return '—'
      return h(NSpace, { size: 'small' }, () =>
        row.roles.map((role) => h(NTag, { type: 'info', size: 'small' }, () => role.name))
      )
    },
  },
  {
    title: 'Status',
    key: 'isActive',
    render: (row) =>
      h(NTag, { type: row.isActive ? 'success' : 'error', size: 'small' }, () =>
        row.isActive ? 'Active' : 'Inactive'
      ),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    render: (row) => {
      const buttons = []
      if (authStore.hasPermission('users:update')) {
        buttons.push(
          h(
            NButton,
            {
              size: 'small',
              quaternary: true,
              onClick: () => openEditModal(row),
            },
            { icon: () => h(Pencil, { size: 16 }) }
          )
        )
      }
      if (authStore.hasPermission('users:delete')) {
        buttons.push(
          h(
            NPopconfirm,
            {
              onPositiveClick: () => handleDelete(row.id),
            },
            {
              trigger: () =>
                h(NButton, { size: 'small', quaternary: true, type: 'error' }, { icon: () => h(Trash2, { size: 16 }) }),
              default: () => 'Are you sure you want to delete this user?',
            }
          )
        )
      }
      return h(NSpace, { size: 'small' }, () => buttons)
    },
  },
])

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
  } catch (error: any) {
    message.error(error.data?.message || 'Failed to fetch users')
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

async function handleSave() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

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
      message.success('User updated successfully')
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
      message.success('User created successfully')
    }
    showModal.value = false
    fetchUsers()
  } catch (error: any) {
    message.error(error.data?.message || 'Failed to save user')
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: string) {
  try {
    await $api(`/api/users/${id}`, { method: 'DELETE' })
    message.success('User deleted successfully')
    fetchUsers()
  } catch (error: any) {
    message.error(error.data?.message || 'Failed to delete user')
  }
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>
