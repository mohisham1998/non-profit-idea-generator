import bcrypt from 'bcryptjs';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getDb } from './db';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(
  email: string, 
  name: string, 
  password: string,
  associationName?: string,
  phoneNumber?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة البيانات غير متاحة');
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error('هذا البريد الإلكتروني مسجل بالفعل');
  }

  const hashedPassword = await hashPassword(password);

  await db.insert(users).values({
    email,
    name,
    password: hashedPassword,
    loginMethod: 'internal',
    status: 'pending', // المستخدم الجديد يكون في حالة انتظار الموافقة
    associationName: associationName || null,
    phoneNumber: phoneNumber || null,
  });

  // جلب المستخدم المنشأ للحصول على id
  const newUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (newUser.length === 0) {
    throw new Error('فشل إنشاء المستخدم');
  }

  return {
    id: newUser[0].id,
    email: newUser[0].email,
    name: newUser[0].name,
    status: newUser[0].status,
    message: 'تم التسجيل بنجاح. يرجى انتظار موافقة المدير للدخول إلى النظام.',
  };
}

export async function loginUser(email: string, password: string) {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة البيانات غير متاحة');
  }

  const userList = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (userList.length === 0) {
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  const user = userList[0];

  if (!user.password) {
    throw new Error('هذا الحساب لم يتم تسجيله بكلمة مرور');
  }

  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // التحقق من حالة المستخدم
  if (user.status === 'pending') {
    throw new Error('حسابك في انتظار موافقة المدير. يرجى الانتظار.');
  }
  
  if (user.status === 'rejected') {
    throw new Error('تم رفض طلب تسجيلك. يرجى التواصل مع الإدارة.');
  }

  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, user.id));

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}
