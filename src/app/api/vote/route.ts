'use server'
import { vote } from '@/actions/sessions';
export async function POST(req: Request) {
    const { sessionId, businessId, voteType } = await req.json();
    await vote(sessionId, businessId, voteType);
    return new Response(JSON.stringify({ success: true }));
}