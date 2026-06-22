"use client";

import { useEffect, useRef, useState } from "react";
import { ModeToggle } from "./ModeToggle";
import { MessageBubble } from "./MessageBubble";

interface Message {
  id: number;
  conversation_id: number;
  role: "user" | "assistant" | "human";
  content: string;
  created_at: number;
}

interface ConversationItem {
  id: number;
  phone: string;
  name: string | null;
  jid: string | null;
  mode: "AI" | "HUMAN";
  last_message_at: number | null;
  created_at: number;
  last_message_preview: string | null;
}

interface ConversationPanelProps {
  conversation: ConversationItem | null;
  onRefresh: () => void;
}

export function ConversationPanel({ conversation, onRefresh }: ConversationPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!conversation) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${conversation.id}`, { cache: "no-store" });
        const data = await res.json();
        if (mounted) setMessages(data.messages ?? []);
      } catch {}
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [conversation?.id]);

  useEffect(() => {
    if (messages.length > 0 && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleModeChange = async (mode: "AI" | "HUMAN") => {
    if (!conversation) return;
    try {
      await fetch(`/api/mode/${conversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      onRefresh();
    } catch {}
  };

  const handleSend = async () => {
    if (!conversation || !inputValue.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`/api/messages/${conversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inputValue.trim() }),
      });
      setInputValue("");
      onRefresh();
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!conversation) return;
    if (!confirm("¿Borrar esta conversación?")) return;
    try {
      await fetch(`/api/conversations/${conversation.id}`, { method: "DELETE" });
      onRefresh();
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <section className="flex-1 flex items-center justify-center bg-neutral-950">
        <p className="text-neutral-500">Selecciona una conversación</p>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col bg-neutral-950">
      <header className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-100">
            {conversation.name || `+${conversation.phone}`}
          </p>
          {conversation.name && (
            <p className="text-xs text-neutral-500">+{conversation.phone}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle
            mode={conversation.mode}
            onChange={handleModeChange}
          />
          <button
            onClick={handleDelete}
            className="text-sm text-neutral-500 hover:text-red-400 transition-colors ml-2"
          >
            Borrar
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
        style={{
          backgroundImage: "url('/chat-bg.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {messages.length === 0 ? (
          <p className="text-neutral-600 text-sm text-center mt-8">
            Sin mensajes aún
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>

      <footer className="p-4 border-t border-neutral-800">
        {conversation.mode === "HUMAN" ? (
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none focus:border-neutral-500"
            />
            <button
              onClick={handleSend}
              disabled={sending || !inputValue.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 text-white text-sm rounded-lg transition-colors"
            >
              Enviar
            </button>
          </div>
        ) : (
          <p className="text-sm text-neutral-500 text-center">
            El agente IA responde automáticamente. Cambia a Modo Humano para
            escribir tú.
          </p>
        )}
      </footer>
    </section>
  );
}