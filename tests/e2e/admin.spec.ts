import { test, expect } from '@playwright/test'

test.describe('Admin User Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin before each test
        await page.goto('/login')
        await page.getByPlaceholder('Enter your email').fill('admin@example.com')
        await page.getByPlaceholder('Enter your password').fill('Admin123!')
        await page.getByRole('button', { name: 'Sign in' }).click()
        await expect(page).toHaveURL('/', { timeout: 10000 })
    })

    test('should access users page as admin', async ({ page }) => {
        await page.goto('/admin/users')

        await expect(page.getByText('User Management')).toBeVisible()
        await expect(page.getByRole('button', { name: 'Add User' })).toBeVisible()
    })

    test('should display users table', async ({ page }) => {
        await page.goto('/admin/users')

        // Wait for table to load
        await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 })

        // Should show the admin user
        await expect(page.getByText('admin@example.com')).toBeVisible()
    })

    test('should open create user modal', async ({ page }) => {
        await page.goto('/admin/users')

        await page.getByRole('button', { name: 'Add User' }).click()

        await expect(page.getByText('Create User')).toBeVisible()
        await expect(page.getByLabel('Email')).toBeVisible()
        await expect(page.getByLabel('Password')).toBeVisible()
    })

    test('should search users', async ({ page }) => {
        await page.goto('/admin/users')

        await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 })

        await page.getByPlaceholder('Search users...').fill('admin')

        // Should filter results
        await expect(page.getByText('admin@example.com')).toBeVisible()
    })
})

test.describe('API Documentation', () => {
    test('should load API docs page', async ({ page }) => {
        await page.goto('/docs')

        // Swagger UI should load
        await expect(page.locator('#swagger-ui')).toBeVisible({ timeout: 15000 })
    })

    test('should display API endpoints', async ({ page }) => {
        await page.goto('/docs')

        // Wait for Swagger UI to fully load
        await expect(page.locator('.swagger-ui')).toBeVisible({ timeout: 15000 })

        // Should show API title
        await expect(page.getByText('Nuxt Base Project API')).toBeVisible({ timeout: 10000 })
    })
})

test.describe('Navigation', () => {
    test('should show navigation links when logged in', async ({ page }) => {
        // Login first
        await page.goto('/login')
        await page.getByPlaceholder('Enter your email').fill('admin@example.com')
        await page.getByPlaceholder('Enter your password').fill('Admin123!')
        await page.getByRole('button', { name: 'Sign in' }).click()
        await expect(page).toHaveURL('/', { timeout: 10000 })

        // Check navigation
        await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'API Docs' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Users' })).toBeVisible()
    })

    test('should logout successfully', async ({ page }) => {
        // Login first
        await page.goto('/login')
        await page.getByPlaceholder('Enter your email').fill('admin@example.com')
        await page.getByPlaceholder('Enter your password').fill('Admin123!')
        await page.getByRole('button', { name: 'Sign in' }).click()
        await expect(page).toHaveURL('/', { timeout: 10000 })

        // Open user menu and logout
        await page.getByRole('button').filter({ has: page.locator('.n-avatar') }).click()
        await page.getByText('Logout').click()

        // Should redirect to login
        await expect(page).toHaveURL('/login', { timeout: 10000 })
    })
})

test.describe('Accessibility', () => {
    test('login page should have proper form labels', async ({ page }) => {
        await page.goto('/login')

        // Check form inputs have proper labels/placeholders
        const emailInput = page.getByPlaceholder('Enter your email')
        const passwordInput = page.getByPlaceholder('Enter your password')

        await expect(emailInput).toBeVisible()
        await expect(passwordInput).toBeVisible()

        // Check submit button is accessible
        await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
    })

    test('users page should have accessible table', async ({ page }) => {
        // Login first
        await page.goto('/login')
        await page.getByPlaceholder('Enter your email').fill('admin@example.com')
        await page.getByPlaceholder('Enter your password').fill('Admin123!')
        await page.getByRole('button', { name: 'Sign in' }).click()
        await expect(page).toHaveURL('/', { timeout: 10000 })

        await page.goto('/admin/users')

        // Table should be accessible
        await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 })
    })
})
