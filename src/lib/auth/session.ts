import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import Session from "@/models/Session";
import User, { type IUser } from "@/models/User";
import { SESSION_COOKIE_NAME } from "./constants";

export { SESSION_COOKIE_NAME };

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a session for `userId`, persists it, and sets the session cookie. */
export async function createSession(userId: string) {
  await connectToDatabase();

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await Session.create({ userId, tokenHash: hashToken(token), expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return { token, expiresAt };
}

/** Reads the session cookie and resolves the active user, or null if there isn't one. */
export async function getSessionUser(): Promise<IUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  await connectToDatabase();

  const session = await Session.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;

  const user = await User.findById(session.userId);
  if (!user || !user.isActive) return null;

  return user;
}

/** Deletes the current session (if any) and clears the cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await connectToDatabase();
    await Session.deleteOne({ tokenHash: hashToken(token) });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
