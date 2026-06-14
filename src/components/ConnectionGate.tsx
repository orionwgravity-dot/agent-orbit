"use client";

import { useEffect, useState } from "react";
import { QRScreen } from "./QRScreen";
import { Dashboard } from "./Dashboard";

type Status = "disconnected" | "qr" | "connecting" | "connected" | "unknown";

export function ConnectionGate() {
  const [status, setStatus] = useState<Status>("unknown");
  const [qrPng, setQrPng] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/connection/status", { cache: "no-store" });
        const data = await res.json();
        setStatus(data.status ?? "unknown");
        setQrPng(data.qrPng ?? null);
        setPhone(data.phone ?? null);
      } catch {
        setStatus("unknown");
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  if (status === "connected" && phone) {
    return <Dashboard phone={phone} />;
  }

  return <QRScreen status={status} qrPng={qrPng} />;
}