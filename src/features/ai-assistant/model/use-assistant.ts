import { useRef, useState } from 'react'
import { getAccessToken } from '@/shared/api/axios-instance'

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  content: string
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export function useAssistant() {
  const [messages, setMessages]         = useState<ChatMessage[]>([])
  const [streaming, setStreaming]       = useState('')
  const [isLoading, setIsLoading]       = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const abortRef                        = useRef<AbortController | null>(null)

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    setError(null)
    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    const history = [...messages, userMsg]
    setMessages(history)
    setIsLoading(true)
    setStreaming('')

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const token = getAccessToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`${API_BASE}/api/assistant/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: trimmed, history: messages }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({})) as { message?: string }
        throw new Error(body.message ?? `Request failed (${res.status})`)
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''
      let assembled = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6)) as { type: string; content?: string; message?: string }
            if (event.type === 'chunk' && event.content) {
              assembled += event.content
              setStreaming(assembled)
            } else if (event.type === 'done') {
              setMessages([...history, { role: 'assistant', content: assembled }])
              setStreaming('')
            } else if (event.type === 'error') {
              throw new Error(event.message ?? 'Assistant error')
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue
            throw parseErr
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setMessages([...history, { role: 'assistant', content: `⚠️ ${msg}` }])
      setError(msg)
    } finally {
      setIsLoading(false)
      setStreaming('')
    }
  }

  function clearHistory() {
    setMessages([])
    setStreaming('')
    setError(null)
  }

  return { messages, streaming, isLoading, error, sendMessage, clearHistory }
}
