<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Roles</h1>
        <p class="opacity-70">Manage roles and their permissions</p>
      </div>
      <n-button
        v-if="authStore.hasPermission('roles:create')"
        type="primary"
        @click="openCreateModal"
      >
        <template #icon>
          <Plus class="w-5 h-5" />
        </template>
        Add Role
      </n-button>
    </div>

    <!-- Roles Table -->
    <n-card>
      <n-data-table
        :columns="columns"
        :data="roles"
        :loading="loading"
        :row-key="(row) => row.id"
      />
    </n-card>

    <!-- Create/Edit Modal -->
    <n-modal v-model:show="showModal" preset="card" :title="editingRole ? 'Edit Role' : 'Create Role'" style="width: 600px;">
      <n-form ref="formRef" :model="form" :rules="rules">
        <n-form-item label="Name" path="name">
          <n-input v-model:value="form.name" placeholder="Role name" />
        </n-form-item>
        <n-form-item label="Description" path="description">
          <n-input v-model:value="form.description" type="textarea" placeholder="Description" />
        </n-form-item>
        <n-form-item label="Permissions" path="permissionIds">
          <div class="permissions-grid">
            <n-checkbox
              v-for="permission in permissions"
              :key="permission.id"
              :checked="form.permissionIds.includes(permission.id)"
              @update:checked="togglePermission(permission.id, $event)"
            >
              <div class="permission-item">
                <span class="font-medium">{{ formatPermissionName(permission.name) }}</span>
                <span class="text-xs opacity-50">{{ permission.description }}</span>
              </div>
            </n-checkbox>
          </div>
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <n-button @click="showModal = false">Cancel</n-button>
          <n-button type="primary" :loading="saving" @click="handleSubmit">
            {{ editingRole ? 'Update' : 'Create' }}
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
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NCheckbox,
  NTag,
  NSpace,
  useMessage,
  useDialog,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui'
import type { VNode } from 'vue'
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
const message = useMessage()
const dialog = useDialog()
const { $api } = useNuxtApp()

const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const loading = ref(false)
const showModal = ref(false)
const formRef = ref<FormInst | null>(null)
const saving = ref(false)
const editingRole = ref<Role | null>(null)

const form = reactive({
  name: '',
  description: '',
  permissionIds: [] as string[],
})

const rules: FormRules = {
  name: [{ required: true, message: 'Name is required', trigger: 'blur' }],
}

function formatPermissionName(name: string): string {
  const [resource, action] = name.split(':')
  return `${resource.charAt(0).toUpperCase() + resource.slice(1)} - ${action.charAt(0).toUpperCase() + action.slice(1)}`
}

function togglePermission(id: string, checked: boolean) {
  if (checked) {
    if (!form.permissionIds.includes(id)) {
      form.permissionIds.push(id)
    }
  } else {
    form.permissionIds = form.permissionIds.filter((p) => p !== id)
  }
}

const columns = computed<DataTableColumns<Role>>(() => [
  { title: 'Name', key: 'name', width: 150 },
  { title: 'Description', key: 'description', render: (row) => row.description || '—' },
  {
    title: 'Permissions',
    key: 'permissions',
    render: (row) => {
      if (!row.permissions?.length) return '—'
      return h(NSpace, { size: 'small', wrap: true }, () =>
        row.permissions.map((p) => h(NTag, { size: 'small', type: 'info' }, () => p.name))
      )
    },
  },
  { title: 'Users', key: 'userCount', width: 80 },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    render: (row) => {
      const buttons: VNode[] = []
      if (authStore.hasPermission('roles:update')) {
        buttons.push(
          h(
            NButton,
            { size: 'small', quaternary: true, onClick: () => openEditModal(row) },
            { icon: () => h(Pencil, { size: 16 }) }
          )
        )
      }
      if (authStore.hasPermission('roles:update') && row.name !== 'admin') {
        buttons.push(
          h(
            NButton,
            { size: 'small', quaternary: true, type: 'error', onClick: () => confirmDelete(row) },
            { icon: () => h(Trash2, { size: 16 }) }
          )
        )
      }
      return h(NSpace, { size: 'small' }, () => buttons)
    },
  },
])

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
  dialog.warning({
    title: 'Delete Role',
    content: `Are you sure you want to delete "${role.name}"?`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: () => deleteRole(role.id),
  })
}

async function fetchRoles() {
  loading.value = true
  try {
    const response = await $api<{ data: Role[] }>('/api/roles', { query: { limit: 100 } })
    roles.value = response.data
  } catch (error: any) {
    message.error(error.data?.message || 'Failed to fetch roles')
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
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  saving.value = true
  try {
    if (editingRole.value) {
      await $api(`/api/roles/${editingRole.value.id}`, {
        method: 'PUT',
        body: form,
      })
      message.success('Role updated successfully')
    } else {
      await $api('/api/roles', {
        method: 'POST',
        body: form,
      })
      message.success('Role created successfully')
    }
    showModal.value = false
    fetchRoles()
  } catch (error: any) {
    message.error(error.data?.message || 'Failed to save role')
  } finally {
    saving.value = false
  }
}

async function deleteRole(id: string) {
  try {
    await $api(`/api/roles/${id}`, { method: 'DELETE' })
    message.success('Role deleted successfully')
    fetchRoles()
  } catch (error: any) {
    message.error(error.data?.message || 'Failed to delete role')
  }
}

onMounted(() => {
  fetchRoles()
  fetchPermissions()
})
</script>

<style scoped>
.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.permission-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
