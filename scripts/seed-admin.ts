/**
 * Seed admin user for PostgreSQL.
 * Run after db:push. Creates admin@admin.com if it doesn't exist.
 *
 * Usage: pnpm run db:seed
 * Or: ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm run db:seed
 */
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema';
import 'dotenv/config';

const EMAIL = process.env.ADMIN_EMAIL || 'admin@admin.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const NAME = process.env.ADMIN_NAME || 'مدير النظام';

async function seedAdmin() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL is required. Add it to .env or:');
    console.error('   DATABASE_URL=postgresql://user:pass@localhost:5432/nonprofit_ideas pnpm run db:seed');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const client = postgres(url);
  const db = drizzle(client);

  try {
    const existing = await db.select().from(users).where(eq(users.email, EMAIL)).limit(1);

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    if (existing.length > 0) {
      await db
        .update(users)
        .set({
          password: hashedPassword,
          role: 'admin',
          status: 'approved',
          loginMethod: 'internal',
          name: NAME,
          updatedAt: new Date(),
        })
        .where(eq(users.email, EMAIL));
      console.log('✅ Admin user updated:', EMAIL);
    } else {
      await db.insert(users).values({
        email: EMAIL,
        name: NAME,
        password: hashedPassword,
        role: 'admin',
        status: 'approved',
        loginMethod: 'internal',
      });
      console.log('✅ Admin user created:', EMAIL);
    }

    console.log('   Email:', EMAIL);
    console.log('   Password:', PASSWORD);
    console.log('   (Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME env vars to customize)');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
    console.error('❌ Error:', message);
    if (code === '42P01') {
      console.error('\n   The "users" table may not exist. Run: pnpm run db:push');
    } else if (message.includes('connect') || message.includes('ECONNREFUSED')) {
      console.error('\n   Cannot connect to PostgreSQL. Ensure it is running and DATABASE_URL is correct.');
    }
    process.exit(1);
  } finally {
    await client.end();
  }

  process.exit(0);
}

seedAdmin();
