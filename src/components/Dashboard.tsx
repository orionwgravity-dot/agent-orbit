"use client";

import { useEffect, useRef, useState } from "react";
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
  const prevSelectedRef = useRef<number | null>(null);

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

  useEffect(() => {
    prevSelectedRef.current = selectedId;
  }, [selectedId]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;
  const showPanelOnMobile = !!selectedId;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <DashboardHeader phone={phone} onRefresh={fetchConversations} />
      <div className="flex-1 grid md:grid-cols-[320px_1fr]">
        <div className={showPanelOnMobile ? "hidden md:flex md:flex-col" : "flex flex-col"}>
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onRefresh={fetchConversations}
          />
        </div>
        <div className={showPanelOnMobile ? "flex flex-col" : "hidden md:flex md:flex-col"}>
          <ConversationPanel
            conversation={selected}
            onRefresh={fetchConversations}
            onBack={() => setSelectedId(null)}
          />
        </div>
      </div>
    </div>
  );
}