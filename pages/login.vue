<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <component :is="icons.Layers" class="w-10 h-10 text-white" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900">Welcome back</h2>
        <p class="mt-2 text-gray-600">Sign in to your account</p>
      </div>

      <n-card class="shadow-lg">
        <n-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleSubmit">
          <n-form-item label="Email" path="email">
            <n-input
              v-model:value="form.email"
              placeholder="Enter your email"
              size="large"
              :input-props="{ type: 'email', autocomplete: 'email' }"
            >
              <template #prefix>
                <component :is="icons.Mail" class="w-5 h-5 text-gray-400" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item label="Password" path="password">
            <n-input
              v-model:value="form.password"
              type="password"
              placeholder="Enter your password"
              size="large"
              show-password-on="click"
              :input-props="{ autocomplete: 'current-password' }"
            >
              <template #prefix>
                <component :is="icons.Lock" class="w-5 h-5 text-gray-400" />
              </template>
            </n-input>
          </n-form-item>

          <n-alert v-if="error" type="error" class="mb-4" closable @close="error = ''">
            {{ error }}
          </n-alert>

          <n-button
            type="primary"
            block
            size="large"
            attr-type="submit"
            :loading="authStore.isLoading"
          >
            Sign in
          </n-button>
        </n-form>

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Don't have an account?
            <NuxtLink to="/register" class="text-primary-600 hover:text-primary-500 font-medium">
              Register
            </NuxtLink>
          </p>
        </div>
      </n-card>

      <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p class="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
        <p class="text-sm text-blue-700">
          Email: <code class="bg-blue-100 px-1 rounded">admin@example.com</code><br />
          Password: <code class="bg-blue-100 px-1 rounded">Admin123!</code>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NCard, NForm, NFormItem, NInput, NButton, NAlert, type FormRules, type FormInst } from 'naive-ui'
import { Layers, Mail, Lock } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
})

const icons = { Layers, Mail, Lock }

const authStore = useAuthStore()
const formRef = ref<FormInst | null>(null)
const error = ref('')

const form = reactive({
  email: 'admin@example.com',
  password: 'Admin123!',
})

const rules: FormRules = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
  ],
}

async function handleSubmit() {
  error.value = ''

  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const result = await authStore.login(form.email, form.password)

  if (result.success) {
    navigateTo('/')
  } else {
    error.value = result.error || 'Login failed'
  }
}
</script>
