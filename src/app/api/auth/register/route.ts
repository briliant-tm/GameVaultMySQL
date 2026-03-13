import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql, pool } from '@/lib/db'
import { signAccessToken, signRefreshToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, nickname } = body

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} OR username = ${username}
    `
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Username or email already taken' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const conn = await pool.getConnection()
    let insertId: number
    try {
      const [result] = await conn.execute(
        'INSERT INTO users (username, email, password_hash, nickname) VALUES (?, ?, ?, ?)',
        [username, email, passwordHash, nickname || username]
      ) as [import('mysql2').ResultSetHeader, import('mysql2').FieldPacket[]]
      insertId = result.insertId
    } finally {
      conn.release()
    }

    const userResult = await sql`SELECT id, username, email, nickname, created_at FROM users WHERE id = ${insertId}`
    const user = userResult.rows[0]

    const payload = { userId: user.id as number, username: user.username as string, email: user.email as string }
    const accessToken = await signAccessToken(payload)
    const refreshToken = await signRefreshToken(payload)

    const tokenHash = await bcrypt.hash(refreshToken, 8)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    await sql`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${tokenHash}, ${expiresAt})
    `

    const response = NextResponse.json({
      success: true,
      data: { user: { id: user.id, username: user.username, email: user.email, nickname: user.nickname } },
      message: 'Account created successfully',
    }, { status: 201 })

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    })
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
