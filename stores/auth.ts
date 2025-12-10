import { defineStore } from 'pinia'

export interface Tenant {
  id: string
  name: string
  slug: string
}

export interface User {
  id: string
  email: string
  name: string | null
  isSuperAdmin: boolean
  tenantId: string | null
  tenant: Tenant | null
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  permissions: string[]
  roles: string[]
  isLoading: boolean
  isInitialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    permissions: [],
    roles: [],
    isLoading: false,
    isInitialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    isSuperAdmin: (state) => state.user?.isSuperAdmin === true,
    currentTenant: (state) => state.user?.tenant || null,
    currentTenantId: (state) => state.user?.tenantId || null,
    hasPermission: (state) => (permission: string) =>
      state.user?.isSuperAdmin || state.permissions.includes(permission),
    hasAnyPermission: (state) => (permissions: string[]) =>
      state.user?.isSuperAdmin || permissions.some((p) => state.permissions.includes(p)),
    hasAllPermissions: (state) => (permissions: string[]) =>
      state.user?.isSuperAdmin || permissions.every((p) => state.permissions.includes(p)),
    hasRole: (state) => (role: string) => state.roles.includes(role),
    isAdmin: (state) => state.user?.isSuperAdmin || state.roles.includes('tenant_admin'),
  },

  actions: {
    setAccessToken(token: string | null) {
      this.accessToken = token
    },

    setUser(user: User | null) {
      this.user = user
    },

    setPermissions(permissions: string[]) {
      this.permissions = permissions
    },

    setRoles(roles: string[]) {
      this.roles = roles
    },

    async login(email: string, password: string, rememberMe: boolean = false) {
      this.isLoading = true
      try {
        const response = await $fetch<{
          success: boolean
          accessToken: string
          user: User
        }>('/api/auth/login', {
          method: 'POST',
          body: { email, password, rememberMe },
        })

        this.accessToken = response.accessToken
        this.user = response.user

        // Fetch user permissions
        await this.fetchUserInfo()

        return { success: true }
      } catch (error: unknown) {
        const message = (error as { data?: { message?: string } })?.data?.message || 'Login failed'
        return { success: false, error: message }
      } finally {
        this.isLoading = false
      }
    },

    async register(email: string, password: string, name?: string) {
      this.isLoading = true
      try {
        await $fetch('/api/auth/register', {
          method: 'POST',
          body: { email, password, name },
        })
        return { success: true }
      } catch (error: unknown) {
        const message =
          (error as { data?: { message?: string } })?.data?.message || 'Registration failed'
        return { success: false, error: message }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        await $fetch('/api/auth/logout', { method: 'POST' })
      } catch {
        // Ignore logout errors
      } finally {
        this.clearAuth()
        navigateTo('/login')
      }
    },

    async refreshToken() {
      try {
        const response = await $fetch<{
          success: boolean
          accessToken: string
        }>('/api/auth/refresh', {
          method: 'POST',
        })

        this.accessToken = response.accessToken
        return true
      } catch {
        this.clearAuth()
        return false
      }
    },

    async fetchUserInfo() {
      if (!this.accessToken) return false

      try {
        const response = await $fetch<{
          success: boolean
          user: User
          roles: string[]
          permissions: string[]
        }>('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        })

        this.user = response.user
        this.roles = response.roles
        this.permissions = response.permissions
        return true
      } catch {
        return false
      }
    },

    async initialize() {
      if (this.isInitialized) return

      // Try to refresh token on app start
      const refreshed = await this.refreshToken()
      if (refreshed) {
        await this.fetchUserInfo()
      }

      this.isInitialized = true
    },

    clearAuth() {
      this.user = null
      this.accessToken = null
      this.permissions = []
      this.roles = []
    },
  },
})
