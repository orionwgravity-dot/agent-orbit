"use client";

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

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onRefresh: () => void;
}

function formatRelative(timestamp: number | null): string {
  if (!timestamp) return "";
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return "ahora";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} días`;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  return (
    <aside className="border-r border-neutral-800 bg-neutral-900 flex flex-col">
      <div className="p-4 border-b border-neutral-800">
        <h2 className="text-sm font-medium text-neutral-300">
          Conversaciones · {conversations.length}
        </h2>
      </div>
      {conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-neutral-500 text-center">
            No hay conversaciones aún.
            <br />
            Los mensajes que reciba el bot aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left p-4 border-b border-neutral-800 transition-colors ${
                selectedId === conv.id
                  ? "bg-neutral-800"
                  : "hover:bg-neutral-800/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-neutral-100 truncate">
                  {conv.name || `+${conv.phone}`}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    conv.mode === "AI"
                      ? "bg-emerald-950 text-emerald-400"
                      : "bg-amber-950 text-amber-400"
                  }`}
                >
                  {conv.mode === "AI" ? "IA" : "Humano"}
                </span>
              </div>
              {conv.name && (
                <p className="text-xs text-neutral-500 mb-1">+{conv.phone}</p>
              )}
              <p className="text-xs text-neutral-500 truncate">
                {conv.last_message_preview || "Sin mensajes"}
              </p>
              {conv.last_message_at && (
                <p className="text-xs text-neutral-600 mt-1">
                  {formatRelative(conv.last_message_at)}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}