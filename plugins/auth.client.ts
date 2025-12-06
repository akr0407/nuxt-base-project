import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
    const authStore = useAuthStore()

    // Only run on client side
    if (import.meta.client) {
        await authStore.initialize()
    }
})
