import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore()

    // Skip middleware on server side
    if (import.meta.server) return

    // Public routes that don't require auth
    const publicRoutes = ['/login', '/register', '/docs']
    const isPublicRoute = publicRoutes.some((route) => to.path.startsWith(route))

    if (isPublicRoute) {
        // Redirect authenticated users away from login/register
        if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
            return navigateTo('/')
        }
        return
    }

    // Protected routes - require authentication
    if (!authStore.isAuthenticated) {
        return navigateTo('/login')
    }
})
