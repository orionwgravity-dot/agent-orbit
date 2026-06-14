import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  DisconnectReason,
  type WASocket,
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcodeTerminal from "qrcode-terminal";
import fs from "fs";
import path from "path";
import { setConnectionState, getConnectionState } from "../db";
import { handleIncomingMessages } from "./handler";
import { startOutboxLoop, stopOutboxLoop } from "./outbox";

const AUTH_DIR = path.resolve(process.cwd(), "auth");
const DATA_DIR = path.resolve(process.cwd(), "data");
const RESTART_FLAG = path.join(DATA_DIR, ".restart");

const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });

let handle: { sock: WASocket; shutdown: () => void } | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export async function start(): Promise<void> {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  let version: [number, number, number] | undefined;
  try {
    ({ version } = await fetchLatestBaileysVersion());
  } catch {
    logger.warn({ msg: "No se pudo obtener versión de Baileys, usando default" });
    version = undefined;
  }

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    browser: Browsers.macOS("Desktop"),
    markOnlineOnConnect: false,
    syncFullHistory: false,
  });

  let currentPhone: string | null = null;

  const shutdown = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    stopOutboxLoop();
    try {
      sock.end(undefined);
    } catch {}
  };

  handle = { sock, shutdown };

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (u) => {
    const { connection, lastDisconnect, qr } = u;

    if (qr) {
      setConnectionState({ status: "qr", qr_string: qr });
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === "connecting") {
      const current = getConnectionState();
      if (current.status === "disconnected") {
        setConnectionState({ status: "connecting" });
      }
    }

    if (connection === "open") {
      const userId = sock.user?.id ?? "";
      const phone = userId.split(":")[0].split("@")[0];
      currentPhone = phone;
      setConnectionState({ status: "connected", phone, qr_string: null });
      startOutboxLoop(sock);
    }

    if (connection === "close") {
      const code = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)
        ?.output?.statusCode;
      stopOutboxLoop();

      if (code === DisconnectReason.loggedOut) {
        setConnectionState({ status: "disconnected", phone: null, qr_string: null });
        return;
      }

      if (handle) {
        handle.sock.end(undefined);
      }
      scheduleReconnect(code);
    }
  });

  sock.ev.on("messages.upsert", (e) => handleIncomingMessages(sock, e));
}

function scheduleReconnect(code: number | undefined): void {
  if (reconnectTimer) return;
  const delay = code === 440 ? 15000 : 5000;
  logger.info({ msg: `Reconectando en ${delay}ms`, code });
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (handle) {
      handle.sock.end(undefined);
    }
    start();
  }, delay);
}

export function watchRestartFlag(): void {
  setInterval(() => {
    if (!fs.existsSync(RESTART_FLAG)) return;
    fs.rmSync(RESTART_FLAG, { force: true });
    logger.info({ msg: "Restart flag detectado, regenerando sesión" });
    if (handle) {
      handle.sock.end(undefined);
    }
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    start();
  }, 1000);
}