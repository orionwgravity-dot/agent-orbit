"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  is_admin: number;
  created_at: number;
}

interface UserManagerProps {
  open: boolean;
  onClose: () => void;
}

export function UserManager({ open, onClose }: UserManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {}
  };

  useEffect(() => {
    if (open) fetchUsers();
  }, [open]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
        }),
      });
      if (res.ok) {
        setNewUsername("");
        setNewPassword("");
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear usuario");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number, username: string) => {
    if (!confirm(`¿Eliminar al usuario "${username}"?`)) return;
    try {
      await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });
      fetchUsers();
    } catch {}
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-100">
            Gestionar usuarios
          </h2>
          <button
            onClick={onClose}
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Nuevo usuario"
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Contraseña"
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 text-white text-sm rounded-lg transition-colors"
            >
              Crear
            </button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-4">
              No hay usuarios adicionales
            </p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between bg-neutral-800 rounded-lg px-3 py-2"
              >
                <div>
                  <span className="text-sm text-neutral-100">
                    {u.username}
                  </span>
                  {u.is_admin === 1 && (
                    <span className="ml-2 text-xs text-emerald-400">admin</span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(u.id, u.username)}
                  className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
