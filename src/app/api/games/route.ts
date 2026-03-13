import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { sql, pool } from '@/lib/db'

// GET /api/games
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const genre = searchParams.get('genre') || ''
    const platform = searchParams.get('platform') || ''

    let query
    if (search || genre || platform) {
      query = await sql`
        SELECT * FROM games
        WHERE user_id = ${user.userId}
          AND (${search} = '' OR title LIKE ${'%' + search + '%'})
          AND (${genre} = '' OR genre LIKE ${'%' + genre + '%'})
          AND (${platform} = '' OR platform LIKE ${'%' + platform + '%'})
        ORDER BY created_at DESC
      `
    } else {
      query = await sql`
        SELECT * FROM games WHERE user_id = ${user.userId} ORDER BY created_at DESC
      `
    }

    return NextResponse.json({ success: true, data: { games: query.rows } })
  })
}

// POST /api/games
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    const body = await req.json()
    const { title, genre, platform, cover_url, notes } = body

    if (!title || !genre || !platform) {
      return NextResponse.json(
        { success: false, error: 'Title, genre, and platform are required' },
        { status: 400 }
      )
    }

    const conn = await pool.getConnection()
    let insertId: number
    try {
      const [result] = await conn.execute(
        'INSERT INTO games (user_id, title, genre, platform, cover_url, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [user.userId, title, genre, platform, cover_url || null, notes || null]
      ) as [import('mysql2').ResultSetHeader, import('mysql2').FieldPacket[]]
      insertId = result.insertId
    } finally {
      conn.release()
    }

    const gameResult = await sql`SELECT * FROM games WHERE id = ${insertId}`
    return NextResponse.json({ success: true, data: { game: gameResult.rows[0] } }, { status: 201 })
  })
}
