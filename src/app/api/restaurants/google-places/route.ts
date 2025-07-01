import { NextRequest, NextResponse } from "next/server";

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude, pageToken } = await req.json();

    console.log(pageToken);
    // Google Places (New) API - Text Search request
    // Approximate 5km in degrees (1 degree latitude ≈ 111km)
    const delta = 0.5; // ~0.045 degrees

    // Adjust delta for latitude (north/south) and longitude (east/west),
    // and handle wrapping near the International Date Line and poles.
    function clampLatitude(lat: number) {
      return Math.max(-90, Math.min(90, lat));
    }

    function wrapLongitude(lng: number) {
      if (lng < -180) return lng + 360;
      if (lng > 180) return lng - 360;
      return lng;
    }

    const lowLat = clampLatitude(latitude - delta);
    const highLat = clampLatitude(latitude + delta);
    const lowLng = wrapLongitude(longitude - delta);
    const highLng = wrapLongitude(longitude + delta);

    const requestBody = {
      locationRestriction: {
        rectangle: {
          low: {
            latitude: lowLat,
            longitude: lowLng,
          },
          high: {
            latitude: highLat,
            longitude: highLng,
          },
        },
      },
      pageSize: 20,
      textQuery: "restaurants open now",
      includedType: "restaurant",
      pageToken,
    };

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask":
            "nextPageToken,places.id,places.displayName,places.photos,places.rating,places.userRatingCount,places.priceLevel,places.websiteUri,places.location,places.formattedAddress,places.types,places.currentOpeningHours,places.googleMapsUri",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Places API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch places" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Google Places API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
