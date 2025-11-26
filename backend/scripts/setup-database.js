import { db } from '../config/database.js';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { users, pricingPlans, featureFlags } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

async function setupDatabase() {
  console.log('Setting up database...');

  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const [existingSuperAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'superadmin@pos.com'))
      .limit(1);

    if (!existingSuperAdmin) {
      await db.insert(users).values({
        username: 'superadmin',
        email: 'superadmin@pos.com',
        password: hashedPassword,
        role: 'super_admin',
        active: true
      });
      console.log('Super admin user created');
    } else {
      console.log('Super admin user already exists');
    }

    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@pos.com'))
      .limit(1);

    if (!existingAdmin) {
      await db.insert(users).values({
        username: 'admin',
        email: 'admin@pos.com',
        password: hashedPassword,
        role: 'admin',
        active: true
      });
      console.log('Demo admin user created');
    } else {
      console.log('Demo admin user already exists');
    }

    const [existingSales] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'sales@pos.com'))
      .limit(1);

    if (!existingSales) {
      await db.insert(users).values({
        username: 'sales',
        email: 'sales@pos.com',
        password: hashedPassword,
        role: 'sales_person',
        active: true
      });
      console.log('Demo sales user created');
    } else {
      console.log('Demo sales user already exists');
    }

    const plans = [
      { name: 'Silver', price: '999.00', maxStaff: 3, maxProducts: 100, features: ['Basic POS', 'Inventory Management', 'Basic Reports'] },
      { name: 'Gold', price: '1999.00', maxStaff: 10, maxProducts: 500, features: ['Advanced POS', 'Inventory Management', 'Advanced Reports', 'Repair Module'] },
      { name: 'Platinum', price: '4999.00', maxStaff: 50, maxProducts: 5000, features: ['Full POS Suite', 'Inventory Management', 'Advanced Reports', 'Repair Module', 'Wholesaler Marketplace', 'Priority Support'] }
    ];

    for (const plan of plans) {
      const [existing] = await db
        .select()
        .from(pricingPlans)
        .where(eq(pricingPlans.name, plan.name))
        .limit(1);

      if (!existing) {
        await db.insert(pricingPlans).values(plan);
        console.log(`Pricing plan "${plan.name}" created`);
      }
    }

    const flags = [
      { name: 'repair_module', description: 'Enable repair management module', isEnabled: true },
      { name: 'wholesaler_marketplace', description: 'Enable wholesaler marketplace', isEnabled: true },
      { name: 'advanced_analytics', description: 'Enable advanced analytics dashboard', isEnabled: true },
      { name: 'mobile_app_sync', description: 'Enable mobile app synchronization', isEnabled: false },
      { name: 'multi_currency', description: 'Enable multi-currency support', isEnabled: false }
    ];

    for (const flag of flags) {
      const [existing] = await db
        .select()
        .from(featureFlags)
        .where(eq(featureFlags.name, flag.name))
        .limit(1);

      if (!existing) {
        await db.insert(featureFlags).values(flag);
        console.log(`Feature flag "${flag.name}" created`);
      }
    }

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
