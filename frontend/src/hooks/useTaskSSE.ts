import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

export function useTaskSSE() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = getCookie('accessToken')
    if (!token) return

    const es = new EventSource(`${API_URL}/sse?token=${token}`)

    es.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'task.enriched') {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      }
    }

    es.onerror = () => {
      es.close()
    }

    return () => {
      es.close()
    }
  }, [queryClient])
}
