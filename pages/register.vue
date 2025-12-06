<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <component :is="icons.UserPlus" class="w-10 h-10 text-white" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900">Create an account</h2>
        <p class="mt-2 text-gray-600">Join us today</p>
      </div>

      <n-card class="shadow-lg">
        <n-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleSubmit">
          <n-form-item label="Name" path="name">
            <n-input
              v-model:value="form.name"
              placeholder="Enter your name"
              size="large"
              :input-props="{ autocomplete: 'name' }"
            >
              <template #prefix>
                <component :is="icons.User" class="w-5 h-5 text-gray-400" />
              </template>
            </n-input>
          </n-form-item>

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
              :input-props="{ autocomplete: 'new-password' }"
            >
              <template #prefix>
                <component :is="icons.Lock" class="w-5 h-5 text-gray-400" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item label="Confirm Password" path="confirmPassword">
            <n-input
              v-model:value="form.confirmPassword"
              type="password"
              placeholder="Confirm your password"
              size="large"
              show-password-on="click"
              :input-props="{ autocomplete: 'new-password' }"
            >
              <template #prefix>
                <component :is="icons.Lock" class="w-5 h-5 text-gray-400" />
              </template>
            </n-input>
          </n-form-item>

          <n-alert v-if="error" type="error" class="mb-4" closable @close="error = ''">
            {{ error }}
          </n-alert>

          <n-alert v-if="success" type="success" class="mb-4">
            Registration successful! Redirecting to login...
          </n-alert>

          <n-button
            type="primary"
            block
            size="large"
            attr-type="submit"
            :loading="authStore.isLoading"
            :disabled="success"
          >
            Create Account
          </n-button>
        </n-form>

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Already have an account?
            <NuxtLink to="/login" class="text-primary-600 hover:text-primary-500 font-medium">
              Sign in
            </NuxtLink>
          </p>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NCard, NForm, NFormItem, NInput, NButton, NAlert, type FormRules, type FormInst } from 'naive-ui'
import { UserPlus, User, Mail, Lock } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
})

const icons = { UserPlus, User, Mail, Lock }

const authStore = useAuthStore()
const formRef = ref<FormInst | null>(null)
const error = ref('')
const success = ref(false)

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const rules: FormRules = {
  name: [
    { required: true, message: 'Name is required', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 8, message: 'Password must be at least 8 characters', trigger: 'blur' },
    {
      validator: (_rule, value) => {
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return new Error('Password must contain uppercase, lowercase, and number')
        }
        return true
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    {
      validator: (_rule, value) => {
        if (value !== form.password) {
          return new Error('Passwords do not match')
        }
        return true
      },
      trigger: 'blur',
    },
  ],
}

async function handleSubmit() {
  error.value = ''
  success.value = false

  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const result = await authStore.register(form.email, form.password, form.name)

  if (result.success) {
    success.value = true
    setTimeout(() => {
      navigateTo('/login')
    }, 2000)
  } else {
    error.value = result.error || 'Registration failed'
  }
}
</script>
