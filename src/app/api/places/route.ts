import {
  convertGooglePlaceToYelpBusiness,
  GooglePlace,
  YelpBusiness,
} from "@/lib/google-places";
import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://places.googleapis.com/v1/places:searchText";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const SEARCH_TYPE = process.env.SEARCH_TYPE || "radius";

const DEG_PER_MILE = 1 / 69;
const TOTAL_MILES = 8;
const DELTA = TOTAL_MILES * DEG_PER_MILE;

const quadrantBounds = (lat: number, lng: number, delta = DELTA) => [
  {
    low: { lat, lng: lng - delta },
    high: { lat: lat + delta, lng },
  },
  {
    low: { lat, lng },
    high: { lat: lat + delta, lng: lng + delta },
  },
  {
    low: { lat: lat - delta, lng: lng - delta },
    high: { lat, lng },
  },
  {
    low: { lat: lat - delta, lng },
    high: { lat, lng: lng + delta },
  },
];

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.photos",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.websiteUri",
  "places.location",
  "places.formattedAddress",
  "places.types",
  "places.currentOpeningHours",
  "places.googleMapsLinks",
];

async function fetchMockData() {
  console.log(">>> MOCK DATA: /places");

  return import("@/app/api/mock/places.json") as Promise<{
    places: GooglePlace[];
  }>;
}

async function fetchPlacesInRadius(
  lat: number,
  lon: number,
  radius = 5000
): Promise<GooglePlace[]> {
  if (process.env.USE_MOCK_DATA === "true") {
    return (await fetchMockData()).places;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": FIELD_MASK.join(","),
    },
    body: JSON.stringify({
      includedType: "restaurant",
      pageSize: 20,
      openNow: true,
      textQuery: "sit down restaurants",
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lon },
          radius,
        },
      },
    }),
  });

  const json = await res.json();
  return json.places || ([] as GooglePlace[]);
}

async function fetchPlacesInBounds(
  low: { lat: number; lng: number },
  high: { lat: number; lng: number },
  category = "sit down"
): Promise<GooglePlace[]> {
  if (process.env.USE_MOCK_DATA === "true") {
    return (await fetchMockData()).places;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": FIELD_MASK.join(","),
    },
    body: JSON.stringify({
      includedType: "restaurant",
      pageSize: 20,
      openNow: true,
      textQuery: `best ${category} restaurants`,
      // priceLevels: [],
      minRating: 3.5,
      locationRestriction: {
        rectangle: {
          low: { latitude: low.lat, longitude: low.lng },
          high: { latitude: high.lat, longitude: high.lng },
        },
      },
    }),
  });

  const json = await res.json();
  return json.places || [];
}

export async function POST(req: NextRequest) {
  const { latitude, longitude, raw, category } = await req.json();

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (!lat || !lng) {
    return NextResponse.json({
      error: "Missing latitude or longitude",
      status: 400,
    });
  }

  let results: GooglePlace[] = [];
  let places: YelpBusiness[] = [];

  if (SEARCH_TYPE === "radius") {
    results = await fetchPlacesInRadius(lat, lng);
    places = results.map(convertGooglePlaceToYelpBusiness);
  } else if (SEARCH_TYPE === "bounds") {
    const seen = new Set<string>();
    const bounds = quadrantBounds(lat, lng);

  // const results = await fetchPlacesInBounds(bounds[0].low, bounds[0].high);

    for (const { low, high } of bounds) {
      const results = await fetchPlacesInBounds(low, high, category);
      for (const place of results) {
        if (!seen.has(place.id)) {
          seen.add(place.id);
          places.push(convertGooglePlaceToYelpBusiness(place));
        }
      }
    }
  }

  return NextResponse.json({
    places: raw ? results : places,
  });
}
