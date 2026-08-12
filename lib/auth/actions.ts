"use server";

import { redirect } from "next/navigation";
import { getSession } from "./session";
import type { Role } from "./session-options";

export interface LoginState {
  error?: string;
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  let role: Role | undefined;
  if (password.length > 0 && password === process.env.ADMIN_PASSWORD) {
    role = "admin";
  } else if (
    password.length > 0 &&
    password === process.env.CONSULTANT_PASSWORD
  ) {
    role = "consultant";
  }

  if (!role) {
    return { error: "Wrong password. Even your gut has better instincts than that." };
  }

  const session = await getSession();
  session.role = role;
  await session.save();

  redirect(role === "admin" ? "/calendar" : "/calendar");
}

export async function logout(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
