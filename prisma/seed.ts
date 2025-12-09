import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// All permissions in the system
const ALL_PERMISSIONS = [
    // User management
    { name: 'users:read', description: 'View users' },
    { name: 'users:create', description: 'Create users' },
    { name: 'users:update', description: 'Update users' },
    { name: 'users:delete', description: 'Delete users' },
    // Role management
    { name: 'roles:read', description: 'View roles' },
    { name: 'roles:create', description: 'Create roles' },
    { name: 'roles:update', description: 'Update roles' },
    { name: 'roles:delete', description: 'Delete roles' },
    { name: 'permissions:read', description: 'View permissions' },
    // Settings
    { name: 'settings:read', description: 'View settings' },
    { name: 'settings:update', description: 'Update settings' },
    // Tenant management (SuperAdmin only)
    { name: 'tenants:read', description: 'View all tenants' },
    { name: 'tenants:create', description: 'Create tenants' },
    { name: 'tenants:update', description: 'Update tenants' },
    { name: 'tenants:delete', description: 'Delete tenants' },
]

// Permissions for each role type
const SUPER_ADMIN_PERMISSIONS = ALL_PERMISSIONS.map(p => p.name)

const TENANT_ADMIN_PERMISSIONS = [
    'users:read', 'users:create', 'users:update', 'users:delete',
    'roles:read', 'roles:create', 'roles:update', 'roles:delete',
    'permissions:read',
    'settings:read', 'settings:update',
]

const TENANT_USER_PERMISSIONS = [
    'users:read',
    'roles:read',
    'permissions:read',
    'settings:read',
]

// Helper to find or create a global role (tenantId = null)
async function findOrCreateGlobalRole(name: string, description: string) {
    let role = await prisma.role.findFirst({
        where: { name, tenantId: null, isGlobal: true },
    })
    if (!role) {
        role = await prisma.role.create({
            data: { name, description, isGlobal: true, tenantId: null },
        })
    }
    return role
}

// Helper to find or create a global theme template (tenantId = null)
async function findOrCreateGlobalThemeTemplate(name: string, settings: object, isDefault: boolean) {
    let template = await prisma.themeTemplate.findFirst({
        where: { name, tenantId: null, isGlobal: true },
    })
    if (!template) {
        template = await prisma.themeTemplate.create({
            data: { name, settings, isGlobal: true, isDefault, tenantId: null },
        })
    }
    return template
}

async function main() {
    console.log('🌱 Starting database seed...')

    // Create all permissions
    console.log('Creating permissions...')
    const permissions = await Promise.all(
        ALL_PERMISSIONS.map((permission) =>
            prisma.permission.upsert({
                where: { name: permission.name },
                update: { description: permission.description },
                create: permission,
            })
        )
    )
    console.log(`✅ Created ${permissions.length} permissions`)

    // Create default tenant
    console.log('Creating default tenant...')
    const defaultTenant = await prisma.tenant.upsert({
        where: { slug: 'default' },
        update: {},
        create: {
            name: 'Default Organization',
            slug: 'default',
            isActive: true,
        },
    })
    console.log(`✅ Created default tenant: ${defaultTenant.name}`)

    // Create global super_admin role
    console.log('Creating super_admin role...')
    const superAdminRole = await findOrCreateGlobalRole(
        'super_admin',
        'Super Administrator with full system access'
    )

    // Assign all permissions to super_admin
    const superAdminPermissions = permissions.filter(p =>
        SUPER_ADMIN_PERMISSIONS.includes(p.name)
    )
    await Promise.all(
        superAdminPermissions.map((permission) =>
            prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: superAdminRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: superAdminRole.id,
                    permissionId: permission.id,
                },
            })
        )
    )
    console.log('✅ Created super_admin role with all permissions')

    // Create global tenant_admin role template
    console.log('Creating tenant_admin role...')
    const tenantAdminRole = await findOrCreateGlobalRole(
        'tenant_admin',
        'Tenant Administrator with full tenant access'
    )

    const tenantAdminPermissions = permissions.filter(p =>
        TENANT_ADMIN_PERMISSIONS.includes(p.name)
    )
    await Promise.all(
        tenantAdminPermissions.map((permission) =>
            prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: tenantAdminRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: tenantAdminRole.id,
                    permissionId: permission.id,
                },
            })
        )
    )
    console.log('✅ Created tenant_admin role with tenant management permissions')

    // Create global tenant_user role template
    console.log('Creating tenant_user role...')
    const tenantUserRole = await findOrCreateGlobalRole(
        'tenant_user',
        'Standard tenant user with read access'
    )

    const tenantUserPermissions = permissions.filter(p =>
        TENANT_USER_PERMISSIONS.includes(p.name)
    )
    await Promise.all(
        tenantUserPermissions.map((permission) =>
            prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: tenantUserRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: tenantUserRole.id,
                    permissionId: permission.id,
                },
            })
        )
    )
    console.log('✅ Created tenant_user role with read permissions')

    // Create SuperAdmin user (no tenant)
    console.log('Creating SuperAdmin user...')
    const hashedPassword = await bcrypt.hash('Admin123!', 12)
    const superAdminUser = await prisma.user.upsert({
        where: { email: 'superadmin@example.com' },
        update: { isSuperAdmin: true, tenantId: null },
        create: {
            email: 'superadmin@example.com',
            password: hashedPassword,
            name: 'Super Administrator',
            isActive: true,
            isSuperAdmin: true,
            tenantId: null,
        },
    })

    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: superAdminUser.id,
                roleId: superAdminRole.id,
            },
        },
        update: {},
        create: {
            userId: superAdminUser.id,
            roleId: superAdminRole.id,
        },
    })
    console.log('✅ Created SuperAdmin: superadmin@example.com / Admin123!')

    // Create Tenant Admin user (in default tenant)
    console.log('Creating Tenant Admin user...')
    const tenantAdminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { tenantId: defaultTenant.id, isSuperAdmin: false },
        create: {
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'Tenant Administrator',
            isActive: true,
            isSuperAdmin: false,
            tenantId: defaultTenant.id,
        },
    })

    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: tenantAdminUser.id,
                roleId: tenantAdminRole.id,
            },
        },
        update: {},
        create: {
            userId: tenantAdminUser.id,
            roleId: tenantAdminRole.id,
        },
    })
    console.log('✅ Created Tenant Admin: admin@example.com / Admin123!')

    // Create Tenant User (in default tenant)
    console.log('Creating Tenant User...')
    const tenantUser = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: { tenantId: defaultTenant.id, isSuperAdmin: false },
        create: {
            email: 'user@example.com',
            password: hashedPassword,
            name: 'Regular User',
            isActive: true,
            isSuperAdmin: false,
            tenantId: defaultTenant.id,
        },
    })

    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: tenantUser.id,
                roleId: tenantUserRole.id,
            },
        },
        update: {},
        create: {
            userId: tenantUser.id,
            roleId: tenantUserRole.id,
        },
    })
    console.log('✅ Created Tenant User: user@example.com / Admin123!')

    // Create default theme settings for the tenant
    console.log('Creating default theme settings...')
    await prisma.settings.upsert({
        where: { tenantId_key: { tenantId: defaultTenant.id, key: 'theme' } },
        update: {},
        create: {
            key: 'theme',
            value: {
                primaryColor: '#0ea5e9',
                primaryColorHover: '#0284c7',
                primaryColorPressed: '#0369a1',
                secondaryColor: '#6366f1',
                sidebarCollapsed: false,
                darkMode: false,
            },
            tenantId: defaultTenant.id,
        },
    })
    console.log('✅ Created default theme settings')

    // Create a global theme template
    console.log('Creating global theme template...')
    await findOrCreateGlobalThemeTemplate(
        'Default Blue',
        {
            primaryColor: '#0ea5e9',
            secondaryColor: '#6366f1',
            darkMode: false,
        },
        true
    )
    console.log('✅ Created global theme template')

    console.log('')
    console.log('🎉 Database seed completed!')
    console.log('')
    console.log('Demo Credentials:')
    console.log('  SuperAdmin: superadmin@example.com / Admin123!')
    console.log('  TenantAdmin: admin@example.com / Admin123!')
    console.log('  TenantUser: user@example.com / Admin123!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
