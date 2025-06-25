export interface Restaurant {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  photos?: Array<{
    height: number;
    width: number;
    photo_reference: string;
  }>;
  opening_hours?: {
    open_now: boolean;
  };
  price_level?: number;
  types: string[];
}

export interface RestaurantResponse {
  results: Restaurant[];
  next_page_token?: string;
}
