import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { sql, pool } from '@/lib/db'

// GET /api/games/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(request, async (req, user) => {
    const result = await sql`
      SELECT * FROM games WHERE id = ${params.id} AND user_id = ${user.userId}
    `
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: { game: result.rows[0] } })
  })
}

// PUT /api/games/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    let affectedRows: number
    try {
      const [result] = await conn.execute(
        'UPDATE games SET title=?, genre=?, platform=?, cover_url=?, notes=?, updated_at=NOW() WHERE id=? AND user_id=?',
        [title, genre, platform, cover_url || null, notes || null, params.id, user.userId]
      ) as [import('mysql2').ResultSetHeader, import('mysql2').FieldPacket[]]
      affectedRows = result.affectedRows
    } finally {
      conn.release()
    }

    if (affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 })
    }

    const gameResult = await sql`SELECT * FROM games WHERE id = ${params.id}`
    return NextResponse.json({ success: true, data: { game: gameResult.rows[0] } })
  })
}

// DELETE /api/games/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(request, async (req, user) => {
    const conn = await pool.getConnection()
    let affectedRows: number
    try {
      const [result] = await conn.execute(
        'DELETE FROM games WHERE id = ? AND user_id = ?',
        [params.id, user.userId]
      ) as [import('mysql2').ResultSetHeader, import('mysql2').FieldPacket[]]
      affectedRows = result.affectedRows
    } finally {
      conn.release()
    }

    if (affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Game deleted' })
  })
}
