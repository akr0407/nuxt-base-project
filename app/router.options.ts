import type { RouterConfig } from '@nuxt/schema'

// Custom router options to prevent Vue Router from intercepting Swagger UI hashes
export default <RouterConfig>{
    scrollBehavior(to, from, savedPosition) {
        // If hash starts with #/, it's likely a Swagger UI deep link - let Swagger handle it
        if (to.hash && to.hash.startsWith('#/')) {
            return false
        }

        if (savedPosition) {
            return savedPosition
        }

        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            }
        }

        return { top: 0, behavior: 'smooth' }
    },
}
