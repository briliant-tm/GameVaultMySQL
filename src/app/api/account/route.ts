import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { withAuth } from '@/lib/middleware'
import { sql, pool } from '@/lib/db'

// PUT /api/account - update nickname or password
export async function PUT(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    const body = await req.json()
    const { nickname, currentPassword, newPassword } = body

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is required to change password' },
          { status: 400 }
        )
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters' },
          { status: 400 }
        )
      }

      const userResult = await sql`SELECT password_hash FROM users WHERE id = ${user.userId}`
      const passwordMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash as string)
      if (!passwordMatch) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 401 })
      }

      const newHash = await bcrypt.hash(newPassword, 12)
      await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${user.userId}`
    }

    if (nickname !== undefined) {
      await sql`UPDATE users SET nickname = ${nickname} WHERE id = ${user.userId}`
    }

    const result = await sql`
      SELECT id, username, email, nickname, created_at FROM users WHERE id = ${user.userId}
    `

    return NextResponse.json({ success: true, data: { user: result.rows[0] }, message: 'Profile updated' })
  })
}

// DELETE /api/account - delete account
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    const body = await req.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required to delete account' }, { status: 400 })
    }

    const userResult = await sql`SELECT password_hash FROM users WHERE id = ${user.userId}`
    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const passwordMatch = await bcrypt.compare(password, userResult.rows[0].password_hash as string)
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 })
    }

    await sql`DELETE FROM users WHERE id = ${user.userId}`

    const response = NextResponse.json({ success: true, message: 'Account deleted' })
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    return response
  })
}
