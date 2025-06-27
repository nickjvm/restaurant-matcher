import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing latitude or longitude" },
      { status: 400 }
    );
  }

  const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
  const response = await fetch(apiUrl, {
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.text();

  console.log(data);
  return NextResponse.json({});
}
