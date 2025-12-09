import { z } from 'zod'

// Theme settings schema
export const themeSettingsSchema = z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
    primaryColorHover: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    primaryColorPressed: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    sidebarCollapsed: z.boolean().optional(),
    darkMode: z.boolean().optional(),
})

export type ThemeSettings = z.infer<typeof themeSettingsSchema>

// Default theme settings
export const defaultThemeSettings: ThemeSettings = {
    primaryColor: '#0ea5e9',
    primaryColorHover: '#0284c7',
    primaryColorPressed: '#0369a1',
    secondaryColor: '#6366f1',
    sidebarCollapsed: false,
    darkMode: false,
}

