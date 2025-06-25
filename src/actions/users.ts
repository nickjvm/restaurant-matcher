'use server'
import { cookies } from 'next/headers'
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessionUsers } from "@/../db/schema";


export async function fetchUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (userId) {
        const result = await db.select().from(sessionUsers).where(eq(sessionUsers.userId, userId)).get();
    
        return result
    } 

    return null
}