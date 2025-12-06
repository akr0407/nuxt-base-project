import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
    test('should show login page', async ({ page }) => {
        await page.goto('/login')

        await expect(page.getByText('Welcome back')).toBeVisible()
        await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
        await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    })

    test('should show demo credentials on login page', async ({ page }) => {
        await page.goto('/login')

        await expect(page.getByText('Demo Credentials:')).toBeVisible()
        await expect(page.getByText('admin@example.com')).toBeVisible()
    })

    test('should show validation errors for empty form', async ({ page }) => {
        await page.goto('/login')

        await page.getByRole('button', { name: 'Sign in' }).click()

        await expect(page.getByText('Email is required')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login')

        await page.getByPlaceholder('Enter your email').fill('wrong@example.com')
        await page.getByPlaceholder('Enter your password').fill('wrongpassword')
        await page.getByRole('button', { name: 'Sign in' }).click()

        await expect(page.getByText(/Invalid email or password/i)).toBeVisible({ timeout: 10000 })
    })

    test('should login successfully with valid credentials', async ({ page }) => {
        await page.goto('/login')

        await page.getByPlaceholder('Enter your email').fill('admin@example.com')
        await page.getByPlaceholder('Enter your password').fill('Admin123!')
        await page.getByRole('button', { name: 'Sign in' }).click()

        // Should redirect to home page
        await expect(page).toHaveURL('/', { timeout: 10000 })
        await expect(page.getByText('Nuxt 3 Base Project')).toBeVisible()
    })

    test('should redirect unauthenticated users from protected routes', async ({ page }) => {
        await page.goto('/admin/users')

        // Should redirect to login
        await expect(page).toHaveURL('/login', { timeout: 10000 })
    })
})

test.describe('Registration Flow', () => {
    test('should show registration page', async ({ page }) => {
        await page.goto('/register')

        await expect(page.getByText('Create an account')).toBeVisible()
        await expect(page.getByPlaceholder('Enter your name')).toBeVisible()
    })

    test('should validate password requirements', async ({ page }) => {
        await page.goto('/register')

        await page.getByPlaceholder('Enter your name').fill('Test User')
        await page.getByPlaceholder('Enter your email').fill('test@example.com')
        await page.getByPlaceholder('Enter your password').first().fill('weak')
        await page.getByPlaceholder('Confirm your password').fill('weak')
        await page.getByRole('button', { name: 'Create Account' }).click()

        await expect(page.getByText(/Password must be at least 8 characters/i)).toBeVisible()
    })

    test('should navigate to login from register page', async ({ page }) => {
        await page.goto('/register')

        await page.getByRole('link', { name: 'Sign in' }).click()

        await expect(page).toHaveURL('/login')
    })
})
