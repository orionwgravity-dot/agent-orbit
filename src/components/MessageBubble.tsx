"use client";

interface Message {
  id: number;
  conversation_id: number;
  role: "user" | "assistant" | "human";
  content: string;
  created_at: number;
}

interface MessageBubbleProps {
  message: Message;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isHuman = message.role === "human";

  const bubbleClass = isUser
    ? "bg-neutral-800 text-neutral-100"
    : isAssistant
    ? "bg-emerald-900/50 text-emerald-100 border border-emerald-800"
    : "bg-amber-900/50 text-amber-100 border border-amber-800";

  const label = isAssistant ? "Agente IA" : isHuman ? "Humano" : null;

  return (
    <div className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}>
      {label && (
        <span
          className={`text-xs px-2 py-0.5 rounded mb-1 ${
            isAssistant
              ? "bg-emerald-950 text-emerald-400"
              : "bg-amber-950 text-amber-400"
          }`}
        >
          {label}
        </span>
      )}
      <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${bubbleClass}`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      <span className="text-xs text-neutral-600 mt-1">{formatTime(message.created_at)}</span>
    </div>
  );
}