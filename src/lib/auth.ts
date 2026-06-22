import { SignJWT, jwtVerify } from "jose";

const SECRET_FALLBACK = "orbit-agent-jwt-secret-change-in-production";

function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET || SECRET_FALLBACK;
  return new TextEncoder().encode(raw);
}

export interface JwtPayload {
  userId: number;
  username: string;
  isAdmin: boolean;
}

export async function signJwt(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(getSecret());
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
