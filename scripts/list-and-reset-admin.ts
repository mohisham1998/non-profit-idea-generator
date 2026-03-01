/**
 * List admin users and reset their password to 12345678.
 * Usage: pnpm tsx scripts/list-and-reset-admin.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { users } from '../drizzle/schema';
import 'dotenv/config';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('❌ DATABASE_URL required in .env');
  process.exit(1);
}

const client = postgres(url);
const db = drizzle(client);

async function main() {
  const admins = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role, status: users.status })
    .from(users)
    .where(eq(users.role, 'admin'));

  console.log('\n=== Admin users ===');
  console.log(JSON.stringify(admins, null, 2));

  if (admins.length === 0) {
    console.log('\nNo admin users found.');
    await client.end();
    process.exit(0);
    return;
  }

  const hashed = await bcrypt.hash('12345678', 10);
  for (const a of admins) {
    await db.update(users).set({ password: hashed, updatedAt: new Date() }).where(eq(users.id, a.id));
    console.log('\n✅ Password reset to 12345678 for:', a.email);
  }

  await client.end();
  console.log('\nDone.\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
