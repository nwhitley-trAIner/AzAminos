import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createAdminSession, clearAdminSession } from '@/lib/admin-auth'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check lockout
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (admin.lockedUntil.getTime() - Date.now()) / 60000
      )
      return NextResponse.json(
        {
          error: `Account locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
        },
        { status: 423 }
      )
    }

    const validPassword = await bcrypt.compare(password, admin.password)

    if (!validPassword) {
      const newAttempts = admin.failedAttempts + 1
      const lockout =
        newAttempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null

      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedAttempts: newAttempts,
          lockedUntil: lockout,
        },
      })

      // Audit log
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: 'LOGIN_FAILED',
          entity: 'AdminUser',
          entityId: admin.id,
          details: { attempt: newAttempts, locked: !!lockout },
        },
      })

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    await createAdminSession(admin)

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN_SUCCESS',
        entity: 'AdminUser',
        entityId: admin.id,
      },
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  await clearAdminSession()
  return NextResponse.json({ success: true })
}
