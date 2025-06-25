// components/NearbyRestaurants.tsx
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchNearbyRestaurants, YelpBusiness } from "@/lib/yelp";

export function NearbyRestaurants() {
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const LIMIT = 50;

  const { data, isLoading, isError, isFetching } = useQuery<YelpBusiness[]>({
    queryKey: ["restaurants", coords?.latitude, coords?.longitude],
    queryFn: () =>
      fetchNearbyRestaurants({
        latitude: coords!.latitude,
        longitude: coords!.longitude,
        offset,
        limit: LIMIT,
      }),
    enabled: !!coords?.latitude && !!coords?.longitude,
  });

  const fetchNextPage = async () => {
    setOffset((prev) => prev + LIMIT);

    // Fetch next page data
    const nextPageData = await fetchNearbyRestaurants({
      latitude: coords!.latitude,
      longitude: coords!.longitude,
      limit: LIMIT,
      offset: offset + LIMIT,
    });

    // Append new data to existing data
    queryClient.setQueryData<YelpBusiness[]>(
      ["restaurants", coords!.latitude, coords!.longitude],
      (oldData) => {
        return [...(oldData || []), ...nextPageData];
      }
    );
  };

  useEffect(() => {
    window.navigator.geolocation.getCurrentPosition((position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setCoords({ latitude, longitude });
    });
  }, []);
  if (isLoading) return <p>Loading nearby restaurants...</p>;
  if (isError) return <p>Failed to load restaurants.</p>;

  if (!data || data.length === 0) {
    return <p>No restaurants found.</p>;
  }

  return (
    <div>
      <ul className="space-y-4">
        {data.map((r) => (
          <li key={r.id} className="p-4 border rounded">
            {/* <p>
              <img src={r.image_url} alt={r.name} />  
            </p> */}
            <p className="font-semibold">{r.name}</p>
            <p className="text-sm text-gray-600">
              {r.location.address1}, {r.location.city}
            </p>
            <p className="text-sm">
              ⭐ {r.rating} ({r.review_count} reviews)
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <button
          onClick={fetchNextPage}
          disabled={isFetching || !data || data.length < LIMIT}
          className={`px-4 py-2 rounded ${
            isFetching
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isFetching ? "Loading..." : "Load More"}
        </button>
      </div>
    </div>
  );
}
