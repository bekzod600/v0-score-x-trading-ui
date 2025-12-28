const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

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

  const url = `${BASE_URL}${path}`

  const headers: Record<string, string> = {
    Accept: "application/json",
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

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

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
      data = { message: text || "Unknown response" }
    }

    if (!response.ok) {
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
        message: err.message || "Network error",
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
