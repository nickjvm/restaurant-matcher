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

export interface GooglePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: Array<{
    displayName: string;
    uri: string;
    photoUri: string;
  }>;
}
export interface GooglePlace {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  photos?: GooglePhoto[];
  rating?: number;
  userRatingCount?: number;
  priceLevel?:
    | "PRICE_LEVEL_FREE"
    | "PRICE_LEVEL_INEXPENSIVE"
    | "PRICE_LEVEL_MODERATE"
    | "PRICE_LEVEL_EXPENSIVE"
    | "PRICE_LEVEL_VERY_EXPENSIVE";
  websiteUri?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  formattedAddress: string;
  types: string[];
  currentOpeningHours?: {
    openNow: boolean;
  };
}

// Convert Google Place to Yelp-like format for compatibility
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

function convertGooglePlaceToYelpBusiness(place: GooglePlace): YelpBusiness {
  // Convert price level to Yelp-style price
  const getPriceString = (priceLevel?: string): string => {
    switch (priceLevel) {
      case "PRICE_LEVEL_FREE":
        return "";
      case "PRICE_LEVEL_INEXPENSIVE":
        return "$";
      case "PRICE_LEVEL_MODERATE":
        return "$$";
      case "PRICE_LEVEL_EXPENSIVE":
        return "$$$";
      case "PRICE_LEVEL_VERY_EXPENSIVE":
        return "$$$$";
      default:
        return "";
    }
  };

  // Parse address components
  const parseAddress = (formattedAddress: string) => {
    const parts = formattedAddress.split(", ");
    return {
      address1: parts[0] || "",
      city: parts[1] || "",
      state: parts[2]?.split(" ")[0] || "",
      zip_code: parts[2]?.split(" ")[1] || "",
    };
  };

  // Convert types to categories
  const getCategories = (types: string[]): { title: string }[] => {
    const categoryMap: Record<string, string> = {
      restaurant: "Restaurant",
      food: "Food",
      meal_takeaway: "Takeaway",
      meal_delivery: "Delivery",
      cafe: "Cafe",
      bar: "Bar",
      bakery: "Bakery",
      fast_food: "Fast Food",
      pizza: "Pizza",
      asian_restaurant: "Asian",
      chinese_restaurant: "Chinese",
      italian_restaurant: "Italian",
      mexican_restaurant: "Mexican",
      indian_restaurant: "Indian",
      japanese_restaurant: "Japanese",
      thai_restaurant: "Thai",
      american_restaurant: "American",
    };

    return types
      .map((type) => categoryMap[type] || type.replace(/_/g, " "))
      .filter(Boolean)
      .map((title) => ({ title }));
  };

  return {
    id: place.id,
    name: place.displayName.text,
    image_url: getPhotoUrl(place),
    rating: place.rating,
    review_count: place.userRatingCount,
    price: getPriceString(place.priceLevel),
    attributes: {
      menu_url: place.websiteUri,
    },
    location: parseAddress(place.formattedAddress),
    coordinates: {
      latitude: place.location.latitude,
      longitude: place.location.longitude,
    },
    categories: getCategories(place.types),
    url:
      place.websiteUri ||
      `https://www.google.com/maps/place/?q=place_id:${place.id}`,
  };
}

// Get photo URL
export const getPhotoUrl = (place: Partial<GooglePlace>): string => {
  if (!place.photos || place.photos.length === 0) {
    return "/placeholder-restaurant.jpg"; // You'll need a placeholder image
  }

  const photo = place.photos[0];
  return `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=400&maxHeightPx=400&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
};

export const GOOGLE_PLACES_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

type FetchNearbyRestaurantsParams = {
  latitude: number;
  longitude: number;
  offset: number;
  limit: number;
  nextPageToken?: string;
};

export interface FetchNearbyRestaurantsResponse {
  places: YelpBusiness[];
  nextPageToken?: string;
}
export async function fetchNearbyRestaurants(
  params: FetchNearbyRestaurantsParams
): Promise<FetchNearbyRestaurantsResponse> {
  const res = await fetch("/api/restaurants/google-places", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Google Places API error: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    places: shuffleArray(data.places.map(convertGooglePlaceToYelpBusiness)),
    nextPageToken: data.nextPageToken,
  };
}

export const fetchCategories = async () => {
  // Google Places doesn't have a separate categories endpoint
  // Return common restaurant categories
  return {
    categories: [
      { alias: "restaurant", title: "Restaurants" },
      { alias: "cafe", title: "Cafes" },
      { alias: "bars", title: "Bars" },
      { alias: "fastfood", title: "Fast Food" },
      { alias: "pizza", title: "Pizza" },
      { alias: "asian", title: "Asian" },
      { alias: "italian", title: "Italian" },
      { alias: "mexican", title: "Mexican" },
      { alias: "american", title: "American" },
      { alias: "indian", title: "Indian" },
    ],
  };
};
