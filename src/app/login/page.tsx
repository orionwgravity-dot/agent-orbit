"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        setError(data.error || "Credenciales incorrectas");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 md:p-8 space-y-5 md:space-y-6"
      >
        <div className="text-center">
          <h1 className="text-xl font-semibold text-neutral-100">
            Agente WhatsApp
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Inicia sesión para continuar
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm text-neutral-400 mb-1"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm text-neutral-400 mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 text-white text-sm rounded-lg transition-colors"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
