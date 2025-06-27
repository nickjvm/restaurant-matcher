"use server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set("shownIntroModal", "true", {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
  });

  return new Response();
}
