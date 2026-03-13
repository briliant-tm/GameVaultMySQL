import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    const result = await sql`
      SELECT id, username, email, nickname, created_at FROM users WHERE id = ${user.userId}
    `
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: { user: result.rows[0] } })
  })
}
