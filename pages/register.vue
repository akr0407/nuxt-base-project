<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserPlus class="w-10 h-10 text-white" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900">Create an account</h2>
        <p class="mt-2 text-gray-600">Get started with your free account</p>
      </div>

      <Card class="shadow-lg">
        <CardContent class="pt-6">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div class="space-y-2">
              <Label for="name">Name</Label>
              <div class="relative">
                <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  v-model="form.name"
                  placeholder="Enter your name"
                  class="pl-10"
                  required
                />
              </div>
            </div>

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
              <p class="text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div class="space-y-2">
              <Label for="confirmPassword">Confirm Password</Label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Confirm your password"
                  class="pl-10"
                  required
                />
              </div>
            </div>

            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <Alert v-if="success" class="bg-green-50 border-green-200 text-green-800">
              <AlertDescription>Registration successful! Redirecting to login...</AlertDescription>
            </Alert>

            <Button type="submit" class="w-full" :disabled="isLoading || success">
              <span v-if="isLoading" class="mr-2 animate-spin">⏳</span>
              Create Account
            </Button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Already have an account?
              <NuxtLink to="/login" class="text-sky-600 hover:text-sky-500 font-medium">
                Sign in
              </NuxtLink>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserPlus, User, Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
})

const authStore = useAuthStore()
const error = ref('')
const success = ref(false)
const showPassword = ref(false)
const isLoading = computed(() => authStore.isLoading)

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

async function handleSubmit() {
  error.value = ''

  if (!form.name || !form.email || !form.password || !form.confirmPassword) {
    error.value = 'Please fill in all fields'
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  if (form.password.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
    error.value =
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
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
