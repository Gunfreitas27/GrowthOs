const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create organization
    const org = await prisma.organization.upsert({
        where: { id: 'test-org-id' },
        update: {},
        create: {
            id: 'test-org-id',
            name: 'Test Organization',
            plan: 'FREE',
        },
    });

    console.log('✅ Created organization:', org.name);

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            name: 'Test User',
            passwordHash: hashedPassword,
            role: 'OWNER',
            organizationId: org.id,
        },
    });

    console.log('✅ Created user:', user.email);
    console.log('\n📝 Login credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123\n');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
