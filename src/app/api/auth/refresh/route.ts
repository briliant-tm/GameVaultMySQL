import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, signAccessToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json({ success: false, error: 'No refresh token' }, { status: 401 })
    }

    const payload = await verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid refresh token' }, { status: 401 })
    }

    const accessToken = await signAccessToken({
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
    })

    const response = NextResponse.json({ success: true, message: 'Token refreshed' })
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
