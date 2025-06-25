// app/api/yelp-proxy/route.ts
import { YELP_API_KEY } from '@/lib/yelp';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const url = new URL(`https://api.yelp.com/v3/businesses/${searchParams.get('id')}?locale=en_US`);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${YELP_API_KEY}`,
      Accept: 'application/json',
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
