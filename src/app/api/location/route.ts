import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  let ip = req.headers.get("x-forwarded-for")?.split(",")[0];

  if (!ip || ip === "::1") {
    ip = "38.175.166.198";
  }

  const apiUrl = `http://ip-api.com/json/${ip}`;
  const response = await fetch(apiUrl);
  const data = await response.json();

  return NextResponse.json({ data });
}
