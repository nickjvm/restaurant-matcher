import { NextRequest, NextResponse } from "next/server";

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude, offset, limit, pageToken } = await req.json();

    // Google Places (New) API - Text Search request
    const requestBody = {
      locationBias: {
        circle: {
          center: {
            latitude: latitude,
            longitude: longitude,
          },
          radius: 5000.0, // 5km radius
        },
      },
      pageSize: 20,
      textQuery: "restaurants open now", // Search for restaurants
      // Specify fields to return
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
            "nextPageToken,places.id,places.displayName,places.photos,places.rating,places.userRatingCount,places.priceLevel,places.websiteUri,places.location,places.formattedAddress,places.types,places.currentOpeningHours",
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

    // console.log("Google Places API response:", data);
    // Handle pagination by slicing the results based on offset
    const places = data.places || [];
    const paginatedPlaces = places.slice(offset, offset + limit);

    return NextResponse.json({
      places: paginatedPlaces,
      total: places.length,
    });
  } catch (error) {
    console.error("Google Places API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
