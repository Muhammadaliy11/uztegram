'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Avatar } from '@/components/ui/avatar-component'
import { Send, ArrowLeft, MessageCircle, Loader2 } from 'lucide-react'
import { timeAgo, cn } from '@/lib/utils'
import Link from 'next/link'

type ConvUser = {
  id: string
  username: string
  name: string | null
  avatar: string | null
}

type Message = {
  id: string
  text: string
  senderId: string
  createdAt: string
  sender: ConvUser
}

type Conversation = {
  id: string
  updatedAt: string
  participants: { user: ConvUser }[]
  messages: Message[]
}

function MessagesContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const convIdParam = searchParams.get('conv')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/messages')
      .then((r) => r.json())
      .then((data) => {
        setConversations(data)
        // URL dan conv id kelsa, shu suhbatni ochish
        if (convIdParam) {
          const found = data.find((c: Conversation) => c.id === convIdParam)
          if (found) setSelected(found)
        }
      })
      .finally(() => setLoading(false))
  }, [convIdParam])

  useEffect(() => {
    if (!selected) return
    fetch(`/api/messages/${selected.id}`)
      .then((r) => r.json())
      .then(setMessages)

    // Auto-refresh har 3 soniyada
    const interval = setInterval(() => {
      fetch(`/api/messages/${selected.id}`)
        .then((r) => r.json())
        .then(setMessages)
    }, 3000)

    return () => clearInterval(interval)
  }, [selected])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getOtherUser = (conv: Conversation) =>
    conv.participants.find((p) => p.user.id !== session?.user?.id)?.user

  const handleSend = async () => {
    if (!text.trim() || !selected || sending) return
    setSending(true)
    const tempText = text
    setText('')
    try {
      const res = await fetch(`/api/messages/${selected.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tempText.trim() }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages((prev) => [...prev, msg])
        // Conversations ni yangilash
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selected.id
              ? { ...c, messages: [msg], updatedAt: new Date().toISOString() }
              : c
          )
        )
      }
    } catch {
      setText(tempText)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)] lg:h-[calc(100vh-40px)] bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      {/* Left: Conversations */}
      <div
        className={cn(
          'w-full lg:w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col',
          selected ? 'hidden lg:flex' : 'flex'
        )}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h1 className="font-bold text-lg">{session?.user ? (session.user as any).username : 'Xabarlar'}</h1>
          <span className="font-bold">Xabarlar</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center flex-1">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
            <MessageCircle size={48} className="text-gray-300 dark:text-gray-700 mb-3" />
            <p className="font-semibold mb-1">Xabarlar yo&apos;q</p>
            <p className="text-sm text-gray-500">
              Birovning profiliga o&apos;tib &quot;Xabar&quot; tugmasini bosing
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {conversations.map((conv) => {
              const other = getOtherUser(conv)
              if (!other) return null
              const lastMsg = conv.messages[0]
              const isActive = selected?.id === conv.id
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left',
                    isActive && 'bg-gray-50 dark:bg-gray-900'
                  )}
                >
                  <Avatar src={other.avatar} name={other.name || other.username} size={52} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{other.username}</p>
                    {lastMsg ? (
                      <p className="text-xs text-gray-500 truncate">
                        {lastMsg.senderId === session?.user?.id ? 'Siz: ' : ''}
                        {lastMsg.text}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">Suhbat boshlang</p>
                    )}
                  </div>
                  {lastMsg && (
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {timeAgo(lastMsg.createdAt)}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Right: Chat */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          {(() => {
            const other = getOtherUser(selected)
            return (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setSelected(null)}
                  className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full"
                >
                  <ArrowLeft size={20} />
                </button>
                <Link href={`/profile/${other?.username}`} className="flex items-center gap-3">
                  <Avatar src={other?.avatar} name={other?.name || other?.username || 'U'} size={40} />
                  <div>
                    <p className="font-semibold text-sm">{other?.username}</p>
                    <p className="text-xs text-gray-500">{other?.name}</p>
                  </div>
                </Link>
              </div>
            )
          })()}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Suhbat boshlang!
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderId === session?.user?.id
              return (
                <div
                  key={msg.id}
                  className={cn('flex items-end gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}
                >
                  {!isMe && (
                    <Avatar src={msg.sender.avatar} name={msg.sender.username} size={28} />
                  )}
                  <div className="flex flex-col gap-0.5 max-w-xs lg:max-w-md">
                    <div
                      className={cn(
                        'px-4 py-2 rounded-2xl text-sm',
                        isMe
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-bl-sm'
                      )}
                    >
                      {msg.text}
                    </div>
                    <p className={cn('text-xs text-gray-400', isMe ? 'text-right' : 'text-left')}>
                      {timeAgo(msg.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2.5">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Xabar yozing..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                maxLength={1000}
                autoFocus
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className={cn(
                  'text-sm font-semibold transition-colors',
                  text.trim() ? 'text-blue-500 hover:text-blue-600' : 'text-gray-300'
                )}
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center flex-col gap-4">
          <div className="w-24 h-24 border-2 border-black dark:border-white rounded-full flex items-center justify-center">
            <MessageCircle size={40} strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-xl mb-1">Xabarlaringiz</p>
            <p className="text-gray-500 text-sm max-w-xs">
              Do&apos;stlaringizga shaxsiy foto va xabarlar yuboring
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}
