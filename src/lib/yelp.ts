function shuffleArray<T>(array: T[]): T[] {
  // Create a copy of the original array to avoid mutating it
  const shuffled = [...array];

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
export interface YelpBusiness {
  id: string;
  name: string;
  image_url: string;
  rating?: number;
  review_count?: number;
  price?: string;
  attributes: {
    menu_url?: string;
  };
  location?: {
    address1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  categories: { title: string }[];
  url: string;
}

export const YELP_API_KEY = process.env.YELP_API_KEY!;

type FetchNearbyRestaurantsParams = {
  latitude: number;
  longitude: number;
  offset: number;
  limit: number;
};

export async function fetchNearbyRestaurants(
  params: FetchNearbyRestaurantsParams
): Promise<YelpBusiness[]> {
  const url = new URL("https://api.yelp.com/v3/businesses/search");
  url.searchParams.set("latitude", String(params.latitude));
  url.searchParams.set("longitude", String(params.longitude));
  url.searchParams.set("categories", "restaurants");
  url.searchParams.set("limit", String(params.limit));
  url.searchParams.set("offset", String(params.offset));
  url.searchParams.set("open_now", String(true));
  url.searchParams.set(
    "sort_by",
    shuffleArray(["best_match", "rating", "review_count", "distance"])[0]
  );

  const res = await fetch(
    "/api/restaurants/yelp?" + url.searchParams.toString()
  );

  if (!res.ok) {
    throw new Error(`Yelp API error: ${res.statusText}`);
  }

  const data = await res.json();
  return shuffleArray(data.businesses);
}

export const fetchCategories = async () => {
  const res = await fetch("/api/restaurants/yelp/categories");

  if (!res.ok) {
    throw new Error(`Yelp API error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.categories;
};
