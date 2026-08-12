export type Role = "admin" | "consultant";

export interface SessionData {
  role?: Role;
}

const sessionPassword = process.env.SESSION_SECRET;
if (!sessionPassword || sessionPassword.length < 32) {
  throw new Error(
    "SESSION_SECRET env var must be set to a string of at least 32 characters."
  );
}

export const sessionOptions = {
  password: sessionPassword,
  cookieName: "crohnicles_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
