export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

/**
 * Upload an image to Vercel Blob via /api/upload.
 * Returns the CDN URL to be saved as cover_image.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  const response = await fetch(
    `/api/upload?filename=${encodeURIComponent(file.name)}`,
    {
      method: "POST",
      body: file,
      headers: {
        "content-type": file.type,
      },
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Upload failed" }))
    throw new Error(error.error ?? "Upload failed")
  }

  return response.json() as Promise<UploadResult>
}
