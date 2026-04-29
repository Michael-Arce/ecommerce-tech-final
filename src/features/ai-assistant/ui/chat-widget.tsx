import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, X, Trash2, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useAssistant, type ChatMessage } from '../model/use-assistant'

// ── Robot SVG ───────────────────────────────────────────────────────────────────

function RobotSVG() {
  return (
    <svg viewBox="0 0 34 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-11 w-9">
      {/* Antenna */}
      <line x1="17" y1="1" x2="17" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.9"/>
      <circle cx="17" cy="1.5" r="2.5" fill="white" fillOpacity="0.9"/>

      {/* Head */}
      <rect x="6" y="7" width="22" height="16" rx="5" fill="white" fillOpacity="0.95"/>

      {/* Eyes */}
      <circle className="robot-eye" cx="12.5" cy="14" r="3" fill="#6D28D9"/>
      <circle className="robot-eye" cx="21.5" cy="14" r="3" fill="#6D28D9"/>
      <circle cx="13.5" cy="13" r="1" fill="white" fillOpacity="0.6"/>
      <circle cx="22.5" cy="13" r="1" fill="white" fillOpacity="0.6"/>

      {/* Mouth */}
      <path d="M11 20 Q17 24 23 20" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

      {/* Neck */}
      <rect x="15" y="23" width="4" height="3" rx="1.5" fill="white" fillOpacity="0.7"/>

      {/* Body */}
      <rect x="8" y="26" width="18" height="13" rx="4" fill="white" fillOpacity="0.88"/>

      {/* Chest panel */}
      <rect x="12" y="29" width="10" height="6" rx="2" fill="#06B6D4" fillOpacity="0.5"/>
      <circle cx="15" cy="32" r="1.2" fill="white" fillOpacity="0.8"/>
      <circle cx="19" cy="32" r="1.2" fill="white" fillOpacity="0.8"/>

      {/* Left arm */}
      <rect x="1" y="26" width="6" height="11" rx="3" fill="white" fillOpacity="0.78"/>

      {/* Right arm — waving */}
      <g className="robot-wave">
        <rect x="27" y="26" width="6" height="11" rx="3" fill="white" fillOpacity="0.78"/>
      </g>

      {/* Legs */}
      <rect x="10" y="39" width="5" height="8" rx="2.5" fill="white" fillOpacity="0.75"/>
      <rect x="19" y="39" width="5" height="8" rx="2.5" fill="white" fillOpacity="0.75"/>
    </svg>
  )
}

// ── Message bubble ──────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="mr-2 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
          <svg viewBox="0 0 34 48" fill="none" className="h-5 w-4">
            <rect x="6" y="7" width="22" height="16" rx="5" fill="#6D28D9" fillOpacity="0.8"/>
            <circle cx="12.5" cy="14" r="3" fill="white"/>
            <circle cx="21.5" cy="14" r="3" fill="white"/>
            <path d="M11 20 Q17 24 23 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <rect x="8" y="26" width="18" height="13" rx="4" fill="#6D28D9" fillOpacity="0.6"/>
          </svg>
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-sm bg-gradient-to-br from-primary to-accent text-white'
            : 'rounded-bl-sm bg-surface text-text shadow-sm',
        )}
      >
        {msg.content.split('\n').map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Typing indicator ────────────────────────────────────────────────────────────

function TypingBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div className="mr-2 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
        <svg viewBox="0 0 34 48" fill="none" className="h-5 w-4">
          <rect x="6" y="7" width="22" height="16" rx="5" fill="#6D28D9" fillOpacity="0.8"/>
          <circle cx="12.5" cy="14" r="3" fill="white"/>
          <circle cx="21.5" cy="14" r="3" fill="white"/>
          <path d="M11 20 Q17 24 23 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <rect x="8" y="26" width="18" height="13" rx="4" fill="#6D28D9" fillOpacity="0.6"/>
        </svg>
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-text shadow-sm">
        {text || (
          <span className="inline-flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main widget ─────────────────────────────────────────────────────────────────

export function ChatWidget() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen]           = useState(false)
  const [input, setInput]             = useState('')
  const [bubbleIndex, setBubbleIndex] = useState(0)
  const [showBubble, setShowBubble]   = useState(false)
  const messagesEndRef                 = useRef<HTMLDivElement>(null)
  const inputRef                       = useRef<HTMLTextAreaElement>(null)

  const { messages, streaming, isLoading, sendMessage, clearHistory } = useAssistant()

  const isEmpty       = messages.length === 0 && !streaming && !isLoading
  const quickActions  = t('assistant.quickActions',  { returnObjects: true }) as string[]
  const bubbleMsgs    = t('assistant.bubbleMessages', { returnObjects: true }) as string[]

  // Periodic bubble messages when chat is closed
  useEffect(() => {
    if (isOpen) {
      setShowBubble(false)
      return
    }

    let hideTimer: ReturnType<typeof setTimeout>
    let nextTimer: ReturnType<typeof setTimeout>
    let idx = 0

    function showNext() {
      setBubbleIndex(idx)
      setShowBubble(true)
      hideTimer = setTimeout(() => {
        setShowBubble(false)
        idx = (idx + 1) % bubbleMsgs.length
        nextTimer = setTimeout(showNext, 10000)
      }, 3000)
    }

    const startTimer = setTimeout(showNext, 2000)
    return () => {
      clearTimeout(startTimer)
      clearTimeout(hideTimer)
      clearTimeout(nextTimer)
      setShowBubble(false)
    }
  }, [isOpen, bubbleMsgs.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming, isLoading])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  async function handleSend() {
    if (!input.trim() || isLoading) return
    const text = input
    setInput('')
    await sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  function handleQuickAction(action: string) {
    void sendMessage(action)
  }

  return (
    <>
      {/* ── Floating robot button + speech bubble ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

        {/* Speech bubble */}
        <div
          className={cn(
            'relative max-w-[180px] rounded-2xl rounded-br-none bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-lg transition-all duration-500',
            showBubble && !isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
          )}
        >
          {bubbleMsgs[bubbleIndex]}
          <span className="absolute -bottom-1.5 right-0 h-3 w-3 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
        </div>

        {/* Robot button */}
        <button
          onClick={() => setIsOpen((o) => !o)}
          aria-label={isOpen ? t('assistant.closeLabel') : t('assistant.openLabel')}
          className={cn(
            'relative flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95',
            isOpen
              ? 'bg-surface text-muted hover:bg-muted/20'
              : 'robot-float bg-gradient-to-br from-primary to-accent text-white shadow-primary/40',
          )}
        >
          {isOpen
            ? <ChevronDown className="h-6 w-6" />
            : <RobotSVG />
          }

          {!isOpen && messages.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {messages.filter((m) => m.role === 'assistant').length}
            </span>
          )}
        </button>
      </div>

      {/* ── Chat panel ── */}
      <div
        className={cn(
          'fixed bottom-28 right-6 z-50 flex w-[360px] flex-col overflow-hidden rounded-2xl border border-secondary/10 bg-background shadow-2xl transition-all duration-200',
          isOpen ? 'max-h-[540px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-secondary/10 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
            <svg viewBox="0 0 34 48" fill="none" className="h-6 w-5">
              <rect x="6" y="7" width="22" height="16" rx="5" fill="white" fillOpacity="0.95"/>
              <circle cx="12.5" cy="14" r="3" fill="#6D28D9"/>
              <circle cx="21.5" cy="14" r="3" fill="#6D28D9"/>
              <path d="M11 20 Q17 24 23 20" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <rect x="8" y="26" width="18" height="13" rx="4" fill="white" fillOpacity="0.8"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text">{t('assistant.title')}</p>
            <p className="text-[11px] text-muted">{t('assistant.subtitle')}</p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              aria-label={t('assistant.clearLabel')}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            aria-label={t('assistant.closeLabel')}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-secondary/20"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {isEmpty ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                <svg viewBox="0 0 34 48" fill="none" className="h-12 w-10">
                  <rect x="6" y="7" width="22" height="16" rx="5" fill="white" fillOpacity="0.95"/>
                  <circle cx="12.5" cy="14" r="3" fill="#6D28D9"/>
                  <circle cx="21.5" cy="14" r="3" fill="#6D28D9"/>
                  <circle cx="13.5" cy="13" r="1" fill="white" fillOpacity="0.6"/>
                  <circle cx="22.5" cy="13" r="1" fill="white" fillOpacity="0.6"/>
                  <path d="M11 20 Q17 24 23 20" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <rect x="8" y="26" width="18" height="13" rx="4" fill="white" fillOpacity="0.88"/>
                  <rect x="12" y="29" width="10" height="6" rx="2" fill="#06B6D4" fillOpacity="0.5"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text">{t('assistant.emptyHeading')}</p>
                <p className="mt-0.5 text-xs text-muted">{t('assistant.emptySubtitle')}</p>
              </div>
              <div className="flex w-full flex-col gap-1.5">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="w-full rounded-xl border border-secondary/15 bg-surface px-3 py-2 text-left text-xs text-muted transition-colors hover:border-accent/30 hover:bg-accent/5 hover:text-text"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {(isLoading || streaming) && <TypingBubble text={streaming} />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer */}
        <p className="border-t border-secondary/10 bg-surface/50 px-4 py-1.5 text-center text-[10px] text-muted/70">
          {t('assistant.disclaimer')}
        </p>

        {/* Input */}
        <div className="border-t border-secondary/10 bg-surface p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('assistant.placeholder')}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-secondary/20 bg-background px-3 py-2 text-sm text-text placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/30"
              style={{ maxHeight: '80px' }}
            />
            <button
              onClick={() => void handleSend()}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
