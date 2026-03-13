import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, JWTPayload } from './jwt'

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const token = request.cookies.get('access_token')?.value

  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const user = await verifyAccessToken(token)
  if (!user) {
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
  }

  return handler(request, user)
}
