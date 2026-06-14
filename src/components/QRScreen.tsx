"use client";

import { useEffect, useState } from "react";

type Status = "disconnected" | "qr" | "connecting" | "connected" | "unknown";

interface QRScreenProps {
  status: Status;
  qrPng: string | null;
}

export function QRScreen({ status, qrPng }: QRScreenProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const showExpiredWarning = elapsed > 60;

  const statusMessages: Record<Status, string> = {
    disconnected: "Esperando al bot...",
    qr: "Generando QR...",
    connecting: "Conectando...",
    connected: "",
    unknown: "Cargando...",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
      <div className="max-w-md w-full bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
        <h1 className="text-xl font-semibold text-center mb-6">Conectar WhatsApp</h1>

        {qrPng ? (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-xl">
              <img src={qrPng} alt="QR Code" className="w-64 h-64" />
            </div>
            {showExpiredWarning && (
              <div className="bg-amber-950 border border-amber-700 text-amber-300 text-sm px-4 py-2 rounded-lg text-center">
                El QR puede haber caducado. Recarga la página para uno nuevo.
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 border-4 border-neutral-700 border-t-emerald-500 rounded-full animate-spin-slow" />
            <p className="text-neutral-400">{statusMessages[status] ?? "Cargando..."}</p>
          </div>
        )}

        <div className="mt-6 text-sm text-neutral-500">
          <p className="font-medium text-neutral-300 mb-2">Cómo vincular:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Abre WhatsApp en tu teléfono</li>
            <li>Ve a Ajustes → Dispositivos vinculados</li>
            <li>Toca "Vincular un dispositivo"</li>
            <li>Escanea el código QR</li>
          </ol>
        </div>
      </div>
    </div>
  );
}