import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const supabase = createAdminClient()

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'
    if (!isImage && !isPdf) {
      return NextResponse.json({ error: 'Only images and PDFs are allowed' }, { status: 400 })
    }

    // Validate file size (max 25MB for PDFs, 10MB for images)
    const maxSize = isPdf ? 25 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large (max ${isPdf ? '25MB' : '10MB'})` },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const folder = isPdf ? 'portfolio-pdfs' : 'portfolio-images'
    const path = `${folder}/${filename}`

    const { data, error } = await supabase.storage.from('portfolio-images').upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) throw error

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('portfolio-images').getPublicUrl(data.path)

    // Track in media table
    const { error: mediaError } = await supabase.from('media').insert({
      bucket: 'portfolio-images',
      name: file.name,
      url: publicUrl,
      size: file.size,
      mime_type: file.type,
      uploaded_by: authResult.user.userId,
    })

    if (mediaError) throw mediaError

    return NextResponse.json({ success: true, url: publicUrl, path: data.path }, { status: 201 })
  } catch (error) {
    console.error('Media upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
