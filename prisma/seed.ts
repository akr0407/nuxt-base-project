import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEFAULT_PERMISSIONS = [
    { name: 'users:read', description: 'View users' },
    { name: 'users:create', description: 'Create users' },
    { name: 'users:update', description: 'Update users' },
    { name: 'users:delete', description: 'Delete users' },
    { name: 'roles:read', description: 'View roles' },
    { name: 'roles:create', description: 'Create roles' },
    { name: 'roles:update', description: 'Update roles' },
    { name: 'permissions:read', description: 'View permissions' },
    { name: 'settings:update', description: 'Update application settings' },
]

async function main() {
    console.log('🌱 Starting database seed...')

    // Create permissions
    console.log('Creating permissions...')
    const permissions = await Promise.all(
        DEFAULT_PERMISSIONS.map((permission) =>
            prisma.permission.upsert({
                where: { name: permission.name },
                update: {},
                create: permission,
            })
        )
    )
    console.log(`✅ Created ${permissions.length} permissions`)

    // Create admin role with all permissions
    console.log('Creating admin role...')
    const adminRole = await prisma.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: {
            name: 'admin',
            description: 'Administrator with full access',
        },
    })

    // Assign all permissions to admin role
    await Promise.all(
        permissions.map((permission) =>
            prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: adminRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: adminRole.id,
                    permissionId: permission.id,
                },
            })
        )
    )
    console.log('✅ Created admin role with all permissions')

    // Create user role with limited permissions
    console.log('Creating user role...')
    const userRole = await prisma.role.upsert({
        where: { name: 'user' },
        update: {},
        create: {
            name: 'user',
            description: 'Standard user with limited access',
        },
    })

    // Assign read permissions to user role
    const userPermissions = permissions.filter((p) =>
        ['users:read', 'roles:read', 'permissions:read'].includes(p.name)
    )
    await Promise.all(
        userPermissions.map((permission) =>
            prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: userRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: userRole.id,
                    permissionId: permission.id,
                },
            })
        )
    )
    console.log('✅ Created user role with read permissions')

    // Create admin user
    console.log('Creating admin user...')
    const hashedPassword = await bcrypt.hash('Admin123!', 12)
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'Administrator',
            isActive: true,
        },
    })

    // Assign admin role to admin user
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: adminUser.id,
                roleId: adminRole.id,
            },
        },
        update: {},
        create: {
            userId: adminUser.id,
            roleId: adminRole.id,
        },
    })
    console.log('✅ Created admin user: admin@example.com / Admin123!')

    console.log('🎉 Database seed completed!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
