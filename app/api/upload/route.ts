import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Only allow image formats
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files allowed (jpg, png, webp, gif)" },
        { status: 400 }
      )
    }

    // 4 MB limit
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be under 4 MB" },
        { status: 400 }
      )
    }

    const blob = await put(file.name, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      contentDisposition: blob.contentDisposition,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
