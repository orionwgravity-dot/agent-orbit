import "./env-loader";
import chalk from "chalk";
import boxen from "boxen";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import * as readline from "readline";

function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function runCommand(cmd: string, args: string[], cwd: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit" });
    child.on("close", (code) => resolve(code === 0));
  });
}

async function main() {
  console.log(
    boxen(chalk.cyan("WhatsApp AI Agent Kit — Setup"), {
      padding: 1,
      borderColor: "cyan",
    })
  );

  console.log(chalk.bold("\nFase A — Verificando sistema...\n"));
  const nodeVersion = process.versions.node.split(".")[0];
  if (parseInt(nodeVersion) < 20) {
    console.log(chalk.red(`✗ Node.js ${nodeVersion} < 20. Necesitas Node 20 o superior.`));
    process.exit(1);
  }
  console.log(chalk.green(`✓ Node.js ${process.versions.node}`));
  console.log(chalk.green(`✓ SO: ${process.platform}`));

  console.log(chalk.bold("\nFase B — Instalando dependencias...\n"));
  const nodeModules = path.resolve(process.cwd(), "node_modules");
  if (!fs.existsSync(nodeModules)) {
    console.log(chalk.yellow("  node_modules no existe, instalando..."));
    const ok = await runCommand("npm", ["install"], process.cwd());
    if (!ok) {
      console.log(chalk.red("\n✗ npm install falló. Verifica tu conexión a internet."));
      process.exit(1);
    }
  } else {
    console.log(chalk.green("  ✓ node_modules presente"));
  }

  console.log(chalk.bold("\nFase C — Configurar OpenRouter...\n"));
  const envPath = path.resolve(process.cwd(), ".env.local");
  const envExamplePath = path.resolve(process.cwd(), ".env.example");
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
  }

  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

  const apiKeyMatch = envContent.match(/^OPENROUTER_API_KEY=(.*)$/m);
  const existingKey = apiKeyMatch?.[1]?.trim() ?? "";

  if (!existingKey) {
    console.log(chalk.yellow("  Necesitas tu API key de OpenRouter."));
    console.log(chalk.gray("  La obtienes en: https://openrouter.ai/keys\n"));

    let key = "";
    while (!key.startsWith("sk-or-")) {
      key = await askQuestion("OpenRouter API Key (sk-or-v1-...): ");
      if (!key.startsWith("sk-or-")) {
        console.log(chalk.red("  Formato inválido. Debe empezar por sk-or-"));
      }
    }

    if (envContent.includes("OPENROUTER_API_KEY=")) {
      envContent = envContent.replace(/^OPENROUTER_API_KEY=.*$/m, `OPENROUTER_API_KEY=${key}`);
    } else {
      envContent += `\nOPENROUTER_API_KEY=${key}\n`;
    }
    fs.writeFileSync(envPath, envContent.trim() + "\n");
    console.log(chalk.green("  ✓ API key guardada en .env.local"));
  } else {
    console.log(chalk.green("  ✓ API key ya configurada"));
  }

  console.log(chalk.bold("\nFase D — Arrancando el bot...\n"));
  console.log(chalk.gray("  Ejecutando: npm run start:all\n"));

  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  spawn(npmCmd, ["run", "start:all"], {
    cwd: process.cwd(),
    stdio: "inherit",
    detached: true,
  });

  console.log(chalk.green("\n✓ Bot arrancado en segundo plano"));
  console.log(chalk.cyan("\n  Abre http://localhost:3000 para ver el QR\n"));
}

main().catch((e) => {
  console.error(chalk.red("Error:"), String(e));
  process.exit(1);
});