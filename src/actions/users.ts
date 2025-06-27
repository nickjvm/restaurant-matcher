"use server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessionUsers, users } from "@/lib/db/schema";
import { v4 as uuid } from "uuid";

export async function signUp(sessionId: string, name: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value || uuid();
  const user = await db
    .insert(users)
    .values({
      id: userId,
      name,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { name },
    })
    .returning()
    .get();

  await db.insert(sessionUsers).values({
    userId: user.id,
    sessionId,
  });

  cookieStore.set("userId", user.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return user;
}

export async function fetchUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (userId) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();

    return result;
  }

  return null;
}
