"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { ConversationList } from "./ConversationList";
import { ConversationPanel } from "./ConversationPanel";

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

interface DashboardProps {
  phone: string;
}

export function Dashboard({ phone }: DashboardProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      const data = await res.json();
      setConversations(data.conversations ?? []);
      if (selectedId === null && data.conversations?.length > 0) {
        setSelectedId(data.conversations[0].id);
      }
    } catch {}
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 2000);
    return () => clearInterval(interval);
  }, []);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <DashboardHeader phone={phone} onRefresh={fetchConversations} />
      <div className="flex-1 grid grid-cols-[320px_1fr]">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRefresh={fetchConversations}
        />
        <ConversationPanel
          conversation={selected}
          onRefresh={fetchConversations}
        />
      </div>
    </div>
  );
}