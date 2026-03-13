import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken } from '@/lib/jwt'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value

    if (refreshToken) {
      const payload = await verifyRefreshToken(refreshToken)
      if (payload) {
        // Invalidate all refresh tokens for user (simple logout)
        await sql`DELETE FROM refresh_tokens WHERE user_id = ${payload.userId}`
      }
    }

    const response = NextResponse.json({ success: true, message: 'Logged out' })
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    return response
  } catch (error) {
    console.error('Logout error:', error)
    const response = NextResponse.json({ success: true, message: 'Logged out' })
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    return response
  }
}
