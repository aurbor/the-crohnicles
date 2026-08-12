import { cookies } from "next/headers";
import { getIronSession, type IronSession } from "iron-session";
import { sessionOptions, type SessionData, type Role } from "./session-options";

export type { Role, SessionData };

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getRole(): Promise<Role | undefined> {
  const session = await getSession();
  return session.role;
}

export async function requireAdmin(): Promise<void> {
  const role = await getRole();
  if (role !== "admin") {
    throw new Error("Unauthorized: admin access required.");
  }
}
