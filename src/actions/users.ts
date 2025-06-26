"use server";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessionUsers } from "@/../db/schema";
import { v4 as uuid } from "uuid";

export async function signUp(sessionId: string, name: string) {
  const cookieStore = await cookies();
  const user = await db
    .insert(sessionUsers)
    .values({
      userId: uuid(),
      sessionId,
      name,
    })
    .returning()
    .get();

  cookieStore.set("userId", user.userId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return user;
}
export async function fetchUser(sessionId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (userId) {
    const result = await db
      .select()
      .from(sessionUsers)
      .where(
        and(
          eq(sessionUsers.userId, userId),
          eq(sessionUsers.sessionId, sessionId)
        )
      )
      .get();

    return result;
  }

  return null;
}
