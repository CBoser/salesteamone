import { PrismaClient, CustomerType, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Cleaning existing data...');
  await prisma.customerExternalId.deleteMany({});
  await prisma.customerPricingTier.deleteMany({});
  await prisma.customerContact.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  // ============================================================================
  // Test Users - Create users with different roles for testing
  // ============================================================================
  console.log('👤 Creating test users...');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mindflow.com',
      passwordHash: await bcrypt.hash('Admin123!', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Created user: ${adminUser.email} (${adminUser.role})`);

  const estimatorUser = await prisma.user.create({
    data: {
      email: 'estimator@mindflow.com',
      passwordHash: await bcrypt.hash('Estimator123!', 10),
      firstName: 'John',
      lastName: 'Estimator',
      role: UserRole.ESTIMATOR,
      isActive: true,
    },
  });
  console.log(`✅ Created user: ${estimatorUser.email} (${estimatorUser.role})`);

  const pmUser = await prisma.user.create({
    data: {
      email: 'pm@mindflow.com',
      passwordHash: await bcrypt.hash('ProjectManager123!', 10),
      firstName: 'Sarah',
      lastName: 'ProjectManager',
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
    },
  });
  console.log(`✅ Created user: ${pmUser.email} (${pmUser.role})`);

  const fieldUser = await prisma.user.create({
    data: {
      email: 'field@mindflow.com',
      passwordHash: await bcrypt.hash('FieldUser123!', 10),
      firstName: 'Mike',
      lastName: 'FieldUser',
      role: UserRole.FIELD_USER,
      isActive: true,
    },
  });
  console.log(`✅ Created user: ${fieldUser.email} (${fieldUser.role})`);

  const viewerUser = await prisma.user.create({
    data: {
      email: 'viewer@mindflow.com',
      passwordHash: await bcrypt.hash('Viewer123!', 10),
      firstName: 'Jane',
      lastName: 'Viewer',
      role: UserRole.VIEWER,
      isActive: true,
    },
  });
  console.log(`✅ Created user: ${viewerUser.email} (${viewerUser.role})`);

  console.log('');

  // ============================================================================
  // Customer 1: RICHMOND (Production Builder)
  // ============================================================================
  console.log('📦 Creating RICHMOND customer...');
  const richmond = await prisma.customer.create({
    data: {
      customerName: 'Richmond American Homes',
      customerType: CustomerType.PRODUCTION,
      pricingTier: 'TIER_1',
      notes: 'Large production builder - Premium tier pricing',
      isActive: true,
      contacts: {
        create: [
          {
            contactName: 'Sarah Johnson',
            role: 'Project Manager',
            email: 'sjohnson@richmondamerican.com',
            phone: '(555) 123-4567',
            isPrimary: true,
            receivesNotifications: true,
          },
          {
            contactName: 'Mike Davis',
            role: 'Purchasing Manager',
            email: 'mdavis@richmondamerican.com',
            phone: '(555) 123-4568',
            isPrimary: false,
            receivesNotifications: true,
          },
          {
            contactName: 'Emily Chen',
            role: 'Estimator',
            email: 'echen@richmondamerican.com',
            phone: '(555) 123-4569',
            isPrimary: false,
            receivesNotifications: false,
          },
        ],
      },
      pricingTiers: {
        create: [
          {
            tierName: 'TIER_1',
            discountPercentage: 15.0,
            effectiveDate: new Date('2025-01-01'),
            expirationDate: new Date('2025-12-31'),
          },
        ],
      },
      externalIds: {
        create: [
          {
            externalSystem: 'SALES_1440',
            externalCustomerId: 'RICH-001',
            externalCustomerName: 'Richmond American',
            isPrimary: true,
          },
          {
            externalSystem: 'HYPHEN_BUILDPRO',
            externalCustomerId: 'BP-RICHMOND-2025',
            externalCustomerName: 'Richmond American Homes',
            isPrimary: false,
          },
        ],
      },
    },
  });
  console.log(`✅ Created customer: ${richmond.customerName} (${richmond.id})`);

  // ============================================================================
  // Customer 2: HOLT (Production Builder)
  // ============================================================================
  console.log('📦 Creating HOLT customer...');
  const holt = await prisma.customer.create({
    data: {
      customerName: 'Holt Homes',
      customerType: CustomerType.PRODUCTION,
      pricingTier: 'TIER_2',
      notes: 'Production builder - Standard tier pricing',
      isActive: true,
      contacts: {
        create: [
          {
            contactName: 'Robert Holt',
            role: 'Owner',
            email: 'rob@holthomes.com',
            phone: '(555) 234-5678',
            isPrimary: true,
            receivesNotifications: true,
          },
          {
            contactName: 'Jennifer Martinez',
            role: 'Operations Manager',
            email: 'jmartinez@holthomes.com',
            phone: '(555) 234-5679',
            isPrimary: false,
            receivesNotifications: true,
          },
        ],
      },
      pricingTiers: {
        create: [
          {
            tierName: 'TIER_2',
            discountPercentage: 10.0,
            effectiveDate: new Date('2025-01-01'),
            expirationDate: new Date('2025-12-31'),
          },
        ],
      },
      externalIds: {
        create: [
          {
            externalSystem: 'SALES_1440',
            externalCustomerId: 'HOLT-001',
            externalCustomerName: 'Holt Homes',
            isPrimary: true,
          },
          {
            externalSystem: 'HOLT_BUILDER_PORTAL',
            externalCustomerId: 'HOLT-PORTAL-2025',
            externalCustomerName: 'Holt Homes Portal',
            isPrimary: false,
          },
        ],
      },
    },
  });
  console.log(`✅ Created customer: ${holt.customerName} (${holt.id})`);

  // ============================================================================
  // Customer 3: Mountain View Custom Homes (Semi-Custom Builder)
  // ============================================================================
  console.log('📦 Creating Mountain View Custom Homes customer...');
  const mountainView = await prisma.customer.create({
    data: {
      customerName: 'Mountain View Custom Homes',
      customerType: CustomerType.SEMI_CUSTOM,
      pricingTier: 'CUSTOM',
      notes: 'Semi-custom builder - Custom negotiated rates based on project scope',
      isActive: true,
      contacts: {
        create: [
          {
            contactName: 'David Thompson',
            role: 'Owner & Lead Designer',
            email: 'david@mountainviewcustom.com',
            phone: '(555) 345-6789',
            isPrimary: true,
            receivesNotifications: true,
          },
          {
            contactName: 'Lisa Anderson',
            role: 'Project Coordinator',
            email: 'lisa@mountainviewcustom.com',
            phone: '(555) 345-6790',
            isPrimary: false,
            receivesNotifications: true,
          },
        ],
      },
      pricingTiers: {
        create: [
          {
            tierName: 'CUSTOM',
            discountPercentage: 12.5,
            effectiveDate: new Date('2025-01-01'),
            expirationDate: new Date('2025-06-30'),
          },
        ],
      },
      externalIds: {
        create: [
          {
            externalSystem: 'SALES_1440',
            externalCustomerId: 'MTNV-001',
            externalCustomerName: 'Mountain View Custom',
            isPrimary: true,
          },
        ],
      },
    },
  });
  console.log(`✅ Created customer: ${mountainView.customerName} (${mountainView.id})`);

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n📊 Seed Summary:');
  const totalUsers = await prisma.user.count();
  const totalCustomers = await prisma.customer.count();
  const totalContacts = await prisma.customerContact.count();
  const totalPricingTiers = await prisma.customerPricingTier.count();
  const totalExternalIds = await prisma.customerExternalId.count();

  console.log(`   Users: ${totalUsers}`);
  console.log(`   Customers: ${totalCustomers}`);
  console.log(`   Contacts: ${totalContacts}`);
  console.log(`   Pricing Tiers: ${totalPricingTiers}`);
  console.log(`   External IDs: ${totalExternalIds}`);
  console.log('\n✨ Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
