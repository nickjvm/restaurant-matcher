"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

import { db } from "@/lib/db";
import { matches, sessions, sessionUsers, votes } from "@/lib/db/schema";

export async function fetchSession(sessionId: string) {
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.sessionId, sessionId))
    .get();

  return result;
}

export type StartSessionParams = {
  name: string;
  latitude: number;
  longitude: number;
};

export async function startSession(params: StartSessionParams) {
  const cookieStore = await cookies();
  const sessionId = uuid();

  const session = await db
    .insert(sessions)
    .values({
      sessionId,
      locationName: params.name,
      latitude: params.latitude,
      longitude: params.longitude,
    })
    .returning()
    .get();

  const user = await db
    .insert(sessionUsers)
    .values({
      userId: uuid(),
      sessionId,
      name: params.name,
      isCreator: "TRUE",
    })
    .returning()
    .get();

  cookieStore.set("userId", user.userId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(`/play/${session.sessionId}`);
}

export async function getSession(sessionId: string) {
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.sessionId, sessionId))
    .leftJoin(sessionUsers, eq(sessions.sessionId, sessionUsers.sessionId));

  return {
    session: result[0].sessions,
    users: result.map((r) => r.session_users),
  };
}

export async function vote(
  sessionId: string,
  businessId: string,
  voteType: "like" | "dislike"
) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) {
    throw new Error("User not found");
  }

  try {
    await db
      .insert(votes)
      .values({
        sessionId,
        businessId,
        voteType,
        userId,
      })
      .onConflictDoUpdate({
        target: [votes.userId, votes.sessionId, votes.businessId],
        set: { voteType },
      });
  } catch (error) {
    console.log(error);
  }

  if (voteType === "like") {
    const match = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.sessionId, sessionId),
          eq(votes.businessId, businessId),
          eq(votes.voteType, "like")
        )
      );

    if (match.length > 1) {
      await db.insert(matches).values({
        sessionId,
        businessId,
      });

      const details = await fetch(
        `http://localhost:3000/api/restaurants/yelp/details?id=${businessId}`
      ).then((r) => r.json());
      return {
        match: true,
        business: details,
      };
    }
  }

  return {
    match: false,
    business: null,
  };
}

export async function getMatch(sessionId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) {
    throw new Error("User not found");
  }
  const result = await db
    .select()
    .from(matches)
    .where(eq(matches.sessionId, sessionId))
    .get();

  if (result) {
    return await fetch(
      `http://localhost:3000/api/restaurants/yelp/details?id=${result.businessId}`
    ).then((r) => r.json());
  }

  return null;
}
export async function getVotes(sessionId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) {
    throw new Error("User not found");
  }
  const result = await db
    .select()
    .from(votes)
    .where(and(eq(votes.sessionId, sessionId), eq(votes.userId, userId)));

  return result;
}
