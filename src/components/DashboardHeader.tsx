"use client";

import { useState } from "react";
import { UserManager } from "./UserManager";

interface DashboardHeaderProps {
  phone: string;
  onRefresh: () => void;
}

export function DashboardHeader({ phone, onRefresh }: DashboardHeaderProps) {
  const [showUsers, setShowUsers] = useState(false);

  const handleDisconnect = async () => {
    if (!confirm("¿Desconectar el agente? Se regenerará el QR.")) return;
    try {
      await fetch("/api/connection/disconnect", { method: "POST" });
      window.location.reload();
    } catch (e) {
      alert("Error al desconectar: " + String(e));
    }
  };

  const handleLogout = async () => {
    if (!confirm("¿Cerrar sesión?")) return;
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      alert("Error al cerrar sesión: " + String(e));
    }
  };

  return (
    <>
      <header className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span className="text-sm text-neutral-100">Agente conectado</span>
          <span className="text-sm text-neutral-500">+{phone}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUsers(true)}
            className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Usuarios
          </button>
          <button
            onClick={handleDisconnect}
            className="text-sm text-neutral-400 hover:text-red-400 transition-colors"
          >
            Desconectar
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-400 hover:text-red-400 transition-colors"
          >
            Salir
          </button>
        </div>
      </header>
      <UserManager open={showUsers} onClose={() => setShowUsers(false)} />
    </>
  );
}