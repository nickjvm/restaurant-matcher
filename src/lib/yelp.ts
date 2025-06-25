// lib/yelp.ts
export interface YelpBusiness {
    id: string;
    name: string;
    image_url: string;
    rating: number;
    review_count: number;
    price?: string;
    location: {
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
  }
  
  export const YELP_API_KEY = process.env.YELP_API_KEY!;
  
  type FetchNearbyRestaurantsParams = {
    latitude: number;
    longitude: number;
    offset: number;
    limit: number;
  };
  
  export async function fetchNearbyRestaurants(params: FetchNearbyRestaurantsParams): Promise<YelpBusiness[]> {
    const url = new URL('https://api.yelp.com/v3/businesses/search');
    url.searchParams.set('latitude', String(params.latitude));
    url.searchParams.set('longitude', String(params.longitude));
    url.searchParams.set('categories', 'restaurants');
    url.searchParams.set('limit', String(params.limit));
    url.searchParams.set('offset', String(params.offset));
  
    const res = await fetch('/api/restaurants/yelp?' + url.searchParams.toString());
  
    if (!res.ok) {
      throw new Error(`Yelp API error: ${res.statusText}`);
    }
  
    const data = await res.json();
    return data.businesses;
  }
  

  export const fetchCategories = async () => {
    const res = await fetch('/api/restaurants/yelp/categories');
    
    if (!res.ok) {
      throw new Error(`Yelp API error: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.categories;
  }
        