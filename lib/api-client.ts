export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.error || "Request failed", response.status, data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError("Network error", 0)
  }
}

export const api = {
  get<T>(endpoint: string) {
    return apiRequest<T>(endpoint, { method: "GET" })
  },
  post<T>(endpoint: string, data?: any) {
    return apiRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  },
  put<T>(endpoint: string, data?: any) {
    return apiRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  },
  delete<T>(endpoint: string) {
    return apiRequest<T>(endpoint, { method: "DELETE" })
  },
}
