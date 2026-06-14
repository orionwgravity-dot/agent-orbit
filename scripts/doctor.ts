import "./env-loader";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log(chalk.cyan("\n=== Doctor — Diagnóstico del Kit ===\n"));

let hasIssues = false;

console.log(chalk.bold("1. Variables de entorno"));
{
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.log(chalk.red("  ✗ .env.local no existe"));
    hasIssues = true;
  } else {
    const content = fs.readFileSync(envPath, "utf-8");
    const hasKey = content.includes("OPENROUTER_API_KEY=");
    const keyValue = content.match(/OPENROUTER_API_KEY=(.*)/)?.[1] ?? "";
    if (!hasKey || !keyValue.trim()) {
      console.log(chalk.red("  ✗ OPENROUTER_API_KEY falta o está vacía"));
      hasIssues = true;
    } else {
      console.log(chalk.green("  ✓ OPENROUTER_API_KEY configurada"));
    }
    const model = content.match(/OPENROUTER_MODEL=(.*)/)?.[1] ?? "openai/gpt-4o-mini";
    if (model.includes(":free")) {
      console.log(chalk.red(`  ✗ Modelo :free detectado (${model}) — dar 429 en producción`));
      hasIssues = true;
    } else {
      console.log(chalk.green(`  ✓ Modelo: ${model}`));
    }
  }
}

console.log(chalk.bold("\n2. Dependencias"));
{
  const nodeModules = path.resolve(process.cwd(), "node_modules");
  if (!fs.existsSync(nodeModules)) {
    console.log(chalk.red("  ✗ node_modules no existe — ejecuta npm install"));
    hasIssues = true;
  } else {
    console.log(chalk.green("  ✓ node_modules presente"));
  }
  try {
    execSync("npx tsc --noEmit", { stdio: "pipe", cwd: process.cwd() });
    console.log(chalk.green("  ✓ typecheck pasa"));
  } catch {
    console.log(chalk.red("  ✗ typecheck falla"));
    hasIssues = true;
  }
}

console.log(chalk.bold("\n3. Estado de conexión"));
{
  const DATA_DIR = path.resolve(process.cwd(), "data");
  const DB_PATH = path.join(DATA_DIR, "messages.db");
  if (!fs.existsSync(DB_PATH)) {
    console.log(chalk.yellow("  ⚠ Base de datos no existe aún"));
  } else {
    try {
      const Database = require("better-sqlite3");
      const db = new Database(DB_PATH, { readonly: true });
      const state = db.prepare("SELECT status, phone, qr_string FROM connection_state WHERE id = 1").get() as {
        status: string;
        phone: string | null;
        qr_string: string | null;
      };
      db.close();
      const statusMessages: Record<string, string> = {
        disconnected: "Desconectado — ejecuta npm run start:all",
        qr: "QR disponible — abre http://localhost:3000",
        connecting: "Conectando...",
        connected: `Conectado${state.phone ? " como +" + state.phone : ""}`,
      };
      console.log(chalk.green(`  ✓ Estado: ${statusMessages[state.status] ?? state.status}`));
    } catch (e) {
      console.log(chalk.red(`  ✗ Error leyendo BD: ${String(e)}`));
      hasIssues = true;
    }
  }
}

console.log(chalk.bold("\n4. Ficheros necesarios"));
{
  const AUTH_DIR = path.resolve(process.cwd(), "auth");
  if (!fs.existsSync(AUTH_DIR)) {
    console.log(chalk.yellow("  ⚠ auth/ no existe — se creará al conectar"));
  } else {
    console.log(chalk.green("  ✓ auth/ presente"));
  }
  const negocioPath = path.resolve(process.cwd(), "prompts", "negocio.md");
  if (!fs.existsSync(negocioPath)) {
    console.log(chalk.yellow("  ⚠ prompts/negocio.md no existe — el agente usará prompt genérico"));
  } else {
    console.log(chalk.green("  ✓ prompts/negocio.md presente"));
  }
}

console.log(chalk.bold("\n5. Procesos"));
{
  if (process.platform === "win32") {
    try {
      const out = execSync("tasklist /FI \"IMAGENAME eq node.exe\"", { encoding: "utf-8" });
      const matches = out.match(/node\.exe/g);
      const count = matches ? matches.length : 0;
      if (count > 3) {
        console.log(chalk.yellow(`  ⚠ ${count} procesos node.exe activos (puede haber zombies)`));
      } else {
        console.log(chalk.green(`  ✓ ${count} proceso(s) node.exe`));
      }
    } catch {}
  }
}

console.log(chalk.bold("\n" + (hasIssues ? "❌ Hay problemas que resolver" : "✅ Todo bien") + "\n"));
process.exit(hasIssues ? 1 : 0);