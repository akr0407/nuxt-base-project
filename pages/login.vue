<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Layers class="w-10 h-10 text-white" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900">Welcome back</h2>
        <p class="mt-2 text-gray-600">Sign in to your account</p>
      </div>

      <Card class="shadow-lg">
        <CardContent class="pt-6">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="Enter your email"
                  class="pl-10"
                  required
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="password">Password</Label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  class="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  @click="showPassword = !showPassword"
                >
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <Checkbox id="rememberMe" v-model:checked="form.rememberMe" />
              <Label for="rememberMe" class="text-sm font-normal cursor-pointer">Remember me</Label>
            </div>

            <Alert v-if="error" variant="destructive" class="mb-4">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <Button type="submit" class="w-full" :disabled="isLoading">
              <span v-if="isLoading" class="mr-2 animate-spin">⏳</span>
              Sign in
            </Button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Don't have an account?
              <NuxtLink to="/register" class="text-sky-600 hover:text-sky-500 font-medium">
                Register
              </NuxtLink>
            </p>
          </div>
        </CardContent>
      </Card>

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
import { Layers, Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
})

const authStore = useAuthStore()
const error = ref('')
const showPassword = ref(false)
const isLoading = computed(() => authStore.isLoading)

const form = reactive({
  email: 'admin@example.com',
  password: 'Admin123!',
  rememberMe: true,
})

async function handleSubmit() {
  error.value = ''

  if (!form.email || !form.password) {
    error.value = 'Please fill in all fields'
    return
  }

  const result = await authStore.login(form.email, form.password, form.rememberMe)

  if (result.success) {
    navigateTo('/')
  } else {
    error.value = result.error || 'Login failed'
  }
}
</script>
