'use server'
import { cookies } from 'next/headers'
import { and, eq } from "drizzle-orm";
import { v4 as uuid } from 'uuid';
import { db } from "@/lib/db";
import { sessions, sessionUsers, votes } from "@/../db/schema";
import { redirect } from "next/navigation";

export async function fetchSession(sessionId: string) {
    const result = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId)).get();

    return result
}

export type StartSessionParams = {
    name: string;
    latitude: number;
    longitude: number;
}

export async function startSession(params: StartSessionParams) {
    const cookieStore = await cookies();
    const sessionId = uuid();


    const session = await db.insert(sessions).values({
        sessionId,
        locationName: params.name,
        latitude: params.latitude,
        longitude: params.longitude,
    }).returning().get();

    const user = await db.insert(sessionUsers).values({
        userId: uuid(),
        sessionId,
        name: params.name,
        isCreator: 'TRUE'
    }).returning().get();

    cookieStore.set('userId', user.userId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
    });

    redirect(`/play/${session.sessionId}`)
}

export async function vote(sessionId: string, businessId: string, voteType: 'like' | 'dislike') {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
        throw new Error('User not found');
    }

    await db.insert(votes).values({
        sessionId,
        businessId,
        voteType,
        userId
    })  
}

export async function getVotes(sessionId: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
        throw new Error('User not found');
    }   
    const result = await db.select().from(votes).where(
        and(
            eq(votes.sessionId, sessionId),
            eq(votes.userId, userId)
        )
    );

    console.log(result)
    return result
}