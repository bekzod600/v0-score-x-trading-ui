import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename) {
    return NextResponse.json({ error: "filename required" }, { status: 400 })
  }

  if (!request.body) {
    return NextResponse.json({ error: "No file body" }, { status: 400 })
  }

  // Only allow image formats
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"]
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""
  if (!allowed.includes(ext)) {
    return NextResponse.json(
      { error: "Only image files allowed (jpg, png, webp, gif)" },
      { status: 400 }
    )
  }

  const blob = await put(filename, request.body, {
    access: "public",
    contentType: request.headers.get("content-type") ?? "image/jpeg",
  })

  return NextResponse.json(blob)
}
