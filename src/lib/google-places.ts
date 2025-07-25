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
  googleMapsLinks: {
    placeUri: string;
    directionsUri: string;
    reviewsUri: string;
    photosUri: string;
  };
  googleMapsURI?: string;
}

// Convert Google Place to Yelp-like format for compatibility
export interface YelpBusiness {
  id: string;
  name: string;
  photos: GooglePhoto[];
  rating?: number;
  review_count?: number;
  price?: string;
  attributes: {
    menu_url?: string;
    maps_url?: string;
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
  url?: string;
}

export function convertGooglePlaceToYelpBusiness(
  place: GooglePlace
): YelpBusiness {
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
    name: place.displayName?.text,
    photos: place.photos || [],
    rating: place.rating,
    review_count: place.userRatingCount,
    price: getPriceString(place.priceLevel),
    attributes: {
      menu_url: place.websiteUri,
      maps_url:
        place.googleMapsLinks.placeUri ||
        `https://www.google.com/maps/search/?api=1&query=%20&query_place_id=${place.id}`,
    },
    location: parseAddress(place.formattedAddress),
    coordinates: {
      latitude: place.location.latitude,
      longitude: place.location.longitude,
    },
    categories: getCategories(place.types),
    url: place.websiteUri,
  };
}

export const getPhotoUrl = (place: Partial<GooglePlace>): string | null => {
  if (!place.photos || place.photos.length === 0) {
    return null;
  }
  const photo = place.photos[0];
  return `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=400&maxHeightPx=400&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
};

type FetchNearbyRestaurantsParams = {
  latitude: number;
  longitude: number;
  category: string;
};

export interface FetchNearbyRestaurantsResponse {
  places: YelpBusiness[];
}

export async function fetchNearbyRestaurants(
  params: FetchNearbyRestaurantsParams
): Promise<FetchNearbyRestaurantsResponse> {
  const res = await fetch("/api/places", {
    method: "POST",
    body: JSON.stringify(params),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Google Places API error:", data);
    return {
      places: [],
    };
  }

  return {
    places: shuffleArray(data.places),
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
