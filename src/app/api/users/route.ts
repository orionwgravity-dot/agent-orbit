import { NextRequest, NextResponse } from "next/server";
import { listUsers, createUser, deleteUser } from "@/lib/db";
import { verifyJwt } from "@/lib/auth";

async function getAdminUser(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  if (!payload || !payload.isAdmin) return null;
  return payload;
}

export async function GET(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const users = listUsers();
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña requeridos" },
        { status: 400 }
      );
    }
    const user = createUser(username, password, false);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "El usuario ya existe" },
      { status: 409 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }
    const deleted = deleteUser(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
