import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
    const authStore = useAuthStore()

    // Custom fetch wrapper with auth
    const apiFetch = $fetch.create({
        async onRequest({ options }) {
            const token = authStore.accessToken
            if (token) {
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${token}`,
                }
            }
        },
        async onResponseError({ response }) {
            // Handle 401 errors by attempting to refresh token
            if (response.status === 401 && authStore.isAuthenticated) {
                const refreshed = await authStore.refreshToken()
                if (!refreshed) {
                    authStore.clearAuth()
                    navigateTo('/login')
                }
            }
        },
    })

    return {
        provide: {
            api: apiFetch,
        },
    }
})
