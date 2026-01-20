const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000").replace(/\/+$/, "")

export interface ApiError {
  status: number
  message: string
  details?: unknown
}

export interface ApiRequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE"
  path: string
  token?: string | null
  body?: unknown
  headers?: Record<string, string>
  timeoutMs?: number
}

export async function apiRequest<T>(opts: ApiRequestOptions): Promise<T> {
  const { method, path, token, body, headers: customHeaders, timeoutMs = 15000 } = opts

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = `${BASE_URL}${normalizedPath}`

  const headers: Record<string, string> = {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true", // Required for ngrok free tier
    ...customHeaders,
  }

  if (body) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  console.log(`[v0] API ${method} ${url}`)

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      credentials: "omit", // Don't send cookies to avoid CORS preflight issues
      mode: "cors",
    })

    clearTimeout(timeoutId)

    console.log(`[v0] API response status: ${response.status}`)

    let data: unknown
    const contentType = response.headers.get("content-type")

    if (contentType?.includes("application/json")) {
      try {
        data = await response.json()
      } catch {
        data = null
      }
    } else {
      const text = await response.text()
      console.log(`[v0] Non-JSON response:`, text.substring(0, 200))
      data = { message: text || "Unknown response" }
    }

    // 304 Not Modified is a successful response - browser will use cached data
    if (!response.ok && response.status !== 304) {
      const errorMessage =
        (data && typeof data === "object" && "message" in data && typeof data.message === "string"
          ? data.message
          : null) || (response.status === 401 ? "Unauthorized" : `Request failed with status ${response.status}`)

      const error: ApiError = {
        status: response.status,
        message: errorMessage,
        details: data,
      }
      throw error
    }

    return data as T
  } catch (err) {
    clearTimeout(timeoutId)

    console.error(`[v0] API error for ${method} ${url}:`, err)

    if (err && typeof err === "object" && "status" in err) {
      throw err as ApiError
    }

    if (err instanceof Error) {
      if (err.name === "AbortError") {
        const error: ApiError = {
          status: 408,
          message: "Request timeout",
        }
        throw error
      }

      const error: ApiError = {
        status: 0,
        message:
          err.message === "Failed to fetch"
            ? "Cannot connect to API. Check CORS settings on your backend."
            : err.message || "Network error",
      }
      throw error
    }

    const error: ApiError = {
      status: 0,
      message: "Unknown error occurred",
    }
    throw error
  }
}
