// Type declarations for modules without TypeScript definitions

declare module 'swagger-ui-dist/swagger-ui-bundle' {
    interface SwaggerUIBundle {
        (config: {
            url?: string
            dom_id?: string
            deepLinking?: boolean
            presets?: any[]
            layout?: string
            [key: string]: any
        }): void
        presets: {
            apis: any
        }
        SwaggerUIStandalonePreset: any
    }

    const SwaggerUIBundle: SwaggerUIBundle
    export default SwaggerUIBundle
}

declare module '@scalar/api-reference' {
    export function createScalarApiReference(
        element: HTMLElement,
        config: {
            spec?: { url?: string; content?: string }
            theme?: string
            darkMode?: boolean
            [key: string]: any
        }
    ): void
}

declare module '@stoplight/elements' {
    export const API: any
}
