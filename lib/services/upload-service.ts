export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

/**
 * Upload an image to Vercel Blob via /api/upload.
 * Uses FormData so the server receives the full File with content-length.
 * Returns the CDN URL to be saved as cover_image.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Upload failed" }))
    throw new Error(error.error ?? "Upload failed")
  }

  return response.json() as Promise<UploadResult>
}
