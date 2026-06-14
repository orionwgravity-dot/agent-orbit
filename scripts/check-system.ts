import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const CHECKS = [
  { name: "Node.js >= 20", check: () => {
    const v = process.versions.node.split(".")[0];
    return parseInt(v) >= 20;
  }},
  { name: "Sistema operativo soportado", check: () => {
    return ["darwin", "linux", "win32"].includes(process.platform);
  }},
  { name: "npm presente", check: () => {
    try {
      execSync("npm --version", { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }},
  { name: "Espacio en disco >= 500MB", check: () => {
    try {
      const stat = fs.statfsSync(process.cwd());
      const freeMB = Math.floor((stat.bavail * stat.bsize) / (1024 * 1024));
      return freeMB >= 500;
    } catch {
      return true;
    }
  }},
  { name: "Estructura del kit", check: () => {
    const required = ["package.json", "src/lib/db.ts", "scripts/start-bot.ts"];
    return required.every(f => fs.existsSync(path.resolve(process.cwd(), f)));
  }},
  { name: ".env.local", check: () => {
    return fs.existsSync(path.resolve(process.cwd(), ".env.local"));
  }},
  { name: "node_modules", check: () => {
    return fs.existsSync(path.resolve(process.cwd(), "node_modules"));
  }},
];

let allOk = true;

for (const c of CHECKS) {
  try {
    const ok = c.check();
    console.log(ok ? `✓ ${c.name}` : `✗ ${c.name}`);
    if (!ok) allOk = false;
  } catch (e) {
    console.log(`✗ ${c.name}: ${String(e)}`);
    allOk = false;
  }
}

process.exit(allOk ? 0 : 1);