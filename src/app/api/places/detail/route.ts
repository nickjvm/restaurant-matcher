import {
  convertGooglePlaceToYelpBusiness,
  GooglePlace,
} from "@/lib/google-places";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { id, raw } = await req.json();

    let place: GooglePlace;

    if (process.env.USE_MOCK_DATA === "true") {
      console.log(">>> MOCK DATA: /places/detail");
      const mockData = await import("@/app/api/mock/places.json");
      place = (mockData.places.find((place) => place.id === id) ||
        mockData.places[0]) as GooglePlace;
    } else {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
            "X-Goog-FieldMask":
              "id,displayName,photos,rating,userRatingCount,priceLevel,websiteUri,location,formattedAddress,types,currentOpeningHours,googleMapsUri,generativeSummary,photos,googleMapsLinks",
          },
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

      place = await response.json();
    }

    return NextResponse.json(
      raw ? place : convertGooglePlaceToYelpBusiness(place)
    );
  } catch (error) {
    console.error("Google Places API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
