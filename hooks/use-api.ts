"use client"

import { useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api-client"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(endpoint: string, dependencies: any[] = []) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))
        const data = await api.get<T>(endpoint)

        if (!isCancelled) {
          setState({ data, loading: false, error: null })
        }
      } catch (error) {
        if (!isCancelled) {
          const errorMessage = error instanceof ApiError ? error.message : "An error occurred"
          setState({ data: null, loading: false, error: errorMessage })
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, dependencies)

  const refetch = () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    // Trigger useEffect by updating dependencies
  }

  return { ...state, refetch }
}

export function useApiMutation<T, P = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const mutate = async (endpoint: string, method: "POST" | "PUT" | "DELETE" = "POST", data?: P) => {
    try {
      setState({ data: null, loading: true, error: null })

      let result: T
      switch (method) {
        case "POST":
          result = await api.post<T>(endpoint, data)
          break
        case "PUT":
          result = await api.put<T>(endpoint, data)
          break
        case "DELETE":
          result = await api.delete<T>(endpoint)
          break
      }

      setState({ data: result, loading: false, error: null })
      return result
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "An error occurred"
      setState({ data: null, loading: false, error: errorMessage })
      throw error
    }
  }

  return { ...state, mutate }
}
