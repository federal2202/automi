import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function useTaskSSE() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // The accessToken cookie is httpOnly, so it can't be read from JS. Instead
    // we let EventSource send it automatically via credentials — the backend
    // reads the cookie server-side. No token is ever read in JS or put in the URL.
    const es = new EventSource(`${API_URL}/sse`, { withCredentials: true })

    es.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'task.enriched') {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      }
    }

    // Do NOT close the stream here: native EventSource reconnects automatically
    // with backoff. Calling es.close() on error (the previous behaviour) killed
    // live updates permanently after the first proxy timeout.
    es.onerror = () => {
      // no-op: browser handles reconnect
    }

    return () => {
      es.close()
    }
  }, [queryClient])
}
