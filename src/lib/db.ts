import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "messages.db");

let _ctx: Ctx | null = null;

function ctx(): Ctx {
  if (!_ctx) _ctx = build();
  return _ctx;
}

function build(): Ctx {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);

  const cols = db.prepare("PRAGMA table_info(conversations)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "jid")) {
    db.exec("ALTER TABLE conversations ADD COLUMN jid TEXT");
  }

  return { db };
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  jid TEXT,
  mode TEXT CHECK(mode IN ('AI','HUMAN')) NOT NULL DEFAULT 'AI',
  last_message_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id),
  role TEXT CHECK(role IN ('user','assistant','human')) NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS connection_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  status TEXT CHECK(status IN ('disconnected','qr','connecting','connected')) NOT NULL DEFAULT 'disconnected',
  qr_string TEXT,
  phone TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
INSERT OR IGNORE INTO connection_state (id, status) VALUES (1, 'disconnected');

CREATE TABLE IF NOT EXISTS outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  phone TEXT NOT NULL,
  content TEXT NOT NULL,
  sent INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox(sent, created_at);
`;

export type ConversationMode = "AI" | "HUMAN";
export type MessageRole = "user" | "assistant" | "human";
export type ConnectionStatus = "disconnected" | "qr" | "connecting" | "connected";

export interface Conversation {
  id: number;
  phone: string;
  name: string | null;
  jid: string | null;
  mode: ConversationMode;
  last_message_at: number | null;
  created_at: number;
}

export interface ConversationListItem extends Conversation {
  last_message_preview: string | null;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: MessageRole;
  content: string;
  created_at: number;
}

export interface ConnectionState {
  id: number;
  status: ConnectionStatus;
  qr_string: string | null;
  phone: string | null;
  updated_at: number;
}

export interface OutboxItem {
  id: number;
  conversation_id: number;
  phone: string;
  content: string;
  sent: number;
  created_at: number;
}

interface Ctx {
  db: Database.Database;
}

export function getOrCreateConversation(phone: string, name?: string, jid?: string): Conversation {
  const { db } = ctx();
  const stmt = db.prepare(`
    INSERT INTO conversations (phone, name, jid) VALUES (?, ?, ?)
    ON CONFLICT(phone) DO UPDATE SET
      name = COALESCE(NULLIF(excluded.name, ''), name),
      jid = excluded.jid
    RETURNING *
  `) as Database.Statement;
  return stmt.get(phone, name ?? null, jid ?? null) as Conversation;
}

export function getConversationById(id: number): Conversation | null {
  const { db } = ctx();
  const stmt = db.prepare("SELECT * FROM conversations WHERE id = ?") as Database.Statement;
  return (stmt.get(id) as Conversation) ?? null;
}

export function listConversations(): ConversationListItem[] {
  const { db } = ctx();
  const stmt = db.prepare(`
    SELECT c.*, (SELECT content FROM messages WHERE conversation_id=c.id ORDER BY created_at DESC LIMIT 1) AS last_message_preview
    FROM conversations c
    ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
  `) as Database.Statement;
  return stmt.all() as ConversationListItem[];
}

export function setMode(conversationId: number, mode: ConversationMode): void {
  const { db } = ctx();
  const stmt = db.prepare("UPDATE conversations SET mode = ? WHERE id = ?") as Database.Statement;
  stmt.run(mode, conversationId);
}

export function insertMessage(conversationId: number, role: MessageRole, content: string): number {
  const { db } = ctx();
  const insert = db.prepare("INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)") as Database.Statement;
  const updateConv = db.prepare("UPDATE conversations SET last_message_at = unixepoch() WHERE id = ?") as Database.Statement;
  const tx = db.transaction(() => {
    const result = insert.run(conversationId, role, content);
    updateConv.run(conversationId);
    return result.lastInsertRowid as number;
  });
  return tx();
}

export function getMessages(conversationId: number, limit = 50): Message[] {
  const { db } = ctx();
  const stmt = db.prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?") as Database.Statement;
  return stmt.all(conversationId, limit) as Message[];
}

export function getRecentHistory(conversationId: number, limit = 20): Message[] {
  const { db } = ctx();
  const stmt = db.prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?") as Database.Statement;
  return (stmt.all(conversationId, limit) as Message[]).reverse();
}

export function getConnectionState(): ConnectionState {
  const { db } = ctx();
  const stmt = db.prepare("SELECT * FROM connection_state WHERE id = 1") as Database.Statement;
  return stmt.get() as ConnectionState;
}

export function setConnectionState(input: { status?: ConnectionStatus; qr_string?: string | null; phone?: string | null }): void {
  const current = getConnectionState();
  const status = input.status ?? current.status;
  let qr_string: string | null = current.qr_string;
  let phone: string | null = current.phone;

  if ("qr_string" in input) {
    qr_string = input.qr_string ?? null;
  }
  if (input.phone !== undefined) {
    phone = input.phone;
  }

  const { db } = ctx();
  const stmt = db.prepare(`
    UPDATE connection_state
    SET status = ?, qr_string = ?, phone = ?, updated_at = unixepoch()
    WHERE id = 1
  `) as Database.Statement;
  stmt.run(status, qr_string, phone);
}

export function enqueueOutbox(conversationId: number, phone: string, content: string): number {
  const { db } = ctx();
  const stmt = db.prepare("INSERT INTO outbox (conversation_id, phone, content) VALUES (?, ?, ?)") as Database.Statement;
  const result = stmt.run(conversationId, phone, content);
  return result.lastInsertRowid as number;
}

export function getPendingOutbox(limit = 20): OutboxItem[] {
  const { db } = ctx();
  const stmt = db.prepare("SELECT * FROM outbox WHERE sent = 0 ORDER BY created_at ASC LIMIT ?") as Database.Statement;
  return stmt.all(limit) as OutboxItem[];
}

export function markOutboxSent(id: number): void {
  const { db } = ctx();
  const stmt = db.prepare("UPDATE outbox SET sent = 1 WHERE id = ?") as Database.Statement;
  stmt.run(id);
}

export function deleteConversation(conversationId: number): void {
  const { db } = ctx();
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM messages WHERE conversation_id = ?").run(conversationId);
    db.prepare("DELETE FROM outbox WHERE conversation_id = ? AND sent = 0").run(conversationId);
    db.prepare("DELETE FROM conversations WHERE id = ?").run(conversationId);
  });
  tx();
}