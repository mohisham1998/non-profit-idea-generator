import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { mysqlTable, int, varchar, text, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';

const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  openId: varchar('open_id', { length: 255 }),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  password: varchar('password', { length: 255 }),
  loginMethod: mysqlEnum('login_method', ['oauth', 'internal']).default('oauth'),
  role: mysqlEnum('role', ['admin', 'user']).default('user'),
  status: mysqlEnum('status', ['pending', 'approved', 'rejected']).default('pending'),
  firstSignedIn: timestamp('first_signed_in').defaultNow(),
  lastSignedIn: timestamp('last_signed_in').defaultNow(),
});

async function createAdmin() {
  const email = 'ammaraluofi@gmail.com';
  const name = 'عمار العوفي';
  const password = 'AMM12345amm';
  
  console.log('Connecting to database...');
  const db = drizzle(process.env.DATABASE_URL);
  
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  if (existingUser.length > 0) {
    console.log('User already exists, updating to admin...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db
      .update(users)
      .set({
        password: hashedPassword,
        role: 'admin',
        status: 'approved',
        loginMethod: 'internal',
        name: name,
      })
      .where(eq(users.email, email));
    
    console.log('User updated to admin successfully!');
  } else {
    console.log('Creating new admin user...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.insert(users).values({
      email,
      name,
      password: hashedPassword,
      role: 'admin',
      status: 'approved',
      loginMethod: 'internal',
    });
    
    console.log('Admin user created successfully!');
  }
  
  const adminUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  console.log('Admin user details:');
  console.log('- Email:', adminUser[0].email);
  console.log('- Name:', adminUser[0].name);
  console.log('- Role:', adminUser[0].role);
  console.log('- Status:', adminUser[0].status);
  
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
