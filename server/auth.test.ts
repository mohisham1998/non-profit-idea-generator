import { describe, it, expect, afterAll } from 'vitest';
import { registerUser, loginUser, hashPassword, verifyPassword } from './auth';
import { getDb } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Authentication System', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testName = 'Test User';
  const testPassword = 'Test@Password123';

  afterAll(async () => {
    try {
      const db = await getDb();
      if (db) {
        await db.delete(users).where(eq(users.email, testEmail));
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const hash = await hashPassword(testPassword);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(testPassword);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should verify correct password', async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword(testPassword, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const result = await registerUser(testEmail, testName, testPassword);
      
      expect(result).toBeDefined();
      expect(result.email).toBe(testEmail);
      expect(result.name).toBe(testName);
      expect(result.id).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      try {
        await registerUser(testEmail, 'Another User', testPassword);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('مسجل بالفعل');
      }
    });
  });

  describe('User Login', () => {
    it('should reject login for pending users', async () => {
      // المستخدم المسجل حديثاً يكون في حالة pending
      try {
        await loginUser(testEmail, testPassword);
        expect.fail('Should have thrown an error for pending user');
      } catch (error: any) {
        expect(error.message).toContain('انتظار موافقة المدير');
      }
    });

    it('should login user after approval', async () => {
      // تحديث حالة المستخدم إلى approved
      const db = await getDb();
      await db.update(users).set({ status: 'approved' }).where(eq(users.email, testEmail));
      
      const result = await loginUser(testEmail, testPassword);
      
      expect(result).toBeDefined();
      expect(result.email).toBe(testEmail);
      expect(result.name).toBe(testName);
      expect(result.role).toBe('user');
      expect(result.status).toBe('approved');
    });

    it('should reject login with wrong password', async () => {
      try {
        await loginUser(testEmail, 'WrongPassword');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('غير صحيحة');
      }
    });

    it('should reject login with non-existent email', async () => {
      try {
        await loginUser('nonexistent@example.com', testPassword);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('غير صحيحة');
      }
    });
  });
});
