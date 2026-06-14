import "./env-loader";
import pino from "pino";
import { start, watchRestartFlag } from "../src/lib/baileys/client";

const logger = pino({ level: (process.env.LOG_LEVEL ?? "info") as pino.Level });

if (!process.env.OPENROUTER_API_KEY?.trim()) {
  logger.error("Falta OPENROUTER_API_KEY. Edita .env.local o ejecuta /setup");
  process.exit(1);
}

async function main() {
  await start();
  watchRestartFlag();
}

main().catch((e) => {
  logger.error({ err: e, msg: "Error al iniciar el bot" });
  process.exit(1);
});

process.on("SIGINT", () => {
  logger.info({ msg: "SIGINT recibido, apagando" });
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info({ msg: "SIGTERM recibido, apagando" });
  process.exit(0);
});