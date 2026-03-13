import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const formData = await req.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Only JPG, PNG, WEBP, and GIF images are allowed' },
          { status: 400 }
        )
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, error: 'File size must be under 5MB' },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Save to public/uploads/covers/
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'covers')
      await mkdir(uploadDir, { recursive: true })

      const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
      const filename = `${user.userId}_${Date.now()}.${ext}`
      const filepath = join(uploadDir, filename)

      await writeFile(filepath, buffer)

      const url = `/uploads/covers/${filename}`
      return NextResponse.json({ success: true, data: { url } })
    } catch (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 })
    }
  })
}
