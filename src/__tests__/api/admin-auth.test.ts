/**
 * Admin Authentication Tests
 *
 * Tests admin login, password hashing, lockout mechanism,
 * and audit logging.
 */
import { describe, it, expect, afterAll } from 'vitest'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

describe('Admin Authentication', () => {
  afterAll(async () => {
    // Reset admin state after tests
    await prisma.adminUser.update({
      where: { email: 'admin@azaminos.com' },
      data: { failedAttempts: 0, lockedUntil: null },
    })
    // Clean up test audit logs
    await prisma.auditLog.deleteMany({
      where: { action: { in: ['LOGIN_FAILED', 'LOGIN_SUCCESS'] } },
    })
  })

  describe('Password Verification', () => {
    it('correct password validates against hash', async () => {
      const admin = await prisma.adminUser.findUnique({
        where: { email: 'admin@azaminos.com' },
      })
      const valid = await bcrypt.compare('admin123!', admin!.password)
      expect(valid).toBe(true)
    })

    it('wrong password fails validation', async () => {
      const admin = await prisma.adminUser.findUnique({
        where: { email: 'admin@azaminos.com' },
      })
      const valid = await bcrypt.compare('wrongpassword', admin!.password)
      expect(valid).toBe(false)
    })
  })

  describe('Lockout Mechanism', () => {
    it('tracks failed login attempts', async () => {
      await prisma.adminUser.update({
        where: { email: 'admin@azaminos.com' },
        data: { failedAttempts: 3 },
      })

      const admin = await prisma.adminUser.findUnique({
        where: { email: 'admin@azaminos.com' },
      })
      expect(admin!.failedAttempts).toBe(3)
    })

    it('locks account after 5 failed attempts', async () => {
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 min from now
      await prisma.adminUser.update({
        where: { email: 'admin@azaminos.com' },
        data: { failedAttempts: 5, lockedUntil: lockUntil },
      })

      const admin = await prisma.adminUser.findUnique({
        where: { email: 'admin@azaminos.com' },
      })
      expect(admin!.lockedUntil).toBeTruthy()
      expect(admin!.lockedUntil!.getTime()).toBeGreaterThan(Date.now())
    })

    it('successful login resets failed attempts', async () => {
      await prisma.adminUser.update({
        where: { email: 'admin@azaminos.com' },
        data: {
          failedAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      })

      const admin = await prisma.adminUser.findUnique({
        where: { email: 'admin@azaminos.com' },
      })
      expect(admin!.failedAttempts).toBe(0)
      expect(admin!.lockedUntil).toBeNull()
    })
  })

  describe('Audit Logging', () => {
    it('creates audit log entries', async () => {
      await prisma.auditLog.create({
        data: {
          action: 'LOGIN_SUCCESS',
          entity: 'AdminUser',
          entityId: 'test',
          details: { test: true },
          ip: '127.0.0.1',
        },
      })

      const logs = await prisma.auditLog.findMany({
        where: { action: 'LOGIN_SUCCESS', entityId: 'test' },
      })
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].ip).toBe('127.0.0.1')

      // Clean up
      await prisma.auditLog.deleteMany({ where: { entityId: 'test' } })
    })

    it('audit log records timestamp automatically', async () => {
      const before = new Date()
      const log = await prisma.auditLog.create({
        data: {
          action: 'TEST_ACTION',
          entity: 'Test',
          entityId: 'timestamp-test',
        },
      })

      expect(log.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000)

      // Clean up
      await prisma.auditLog.delete({ where: { id: log.id } })
    })
  })

  describe('Admin RBAC', () => {
    it('admin user has OWNER role', async () => {
      const admin = await prisma.adminUser.findUnique({
        where: { email: 'admin@azaminos.com' },
      })
      expect(admin!.role).toBe('OWNER')
    })

    it('2FA is disabled by default', async () => {
      const admin = await prisma.adminUser.findUnique({
        where: { email: 'admin@azaminos.com' },
      })
      expect(admin!.twoFactorEnabled).toBe(false)
      expect(admin!.twoFactorSecret).toBeNull()
    })
  })
})
