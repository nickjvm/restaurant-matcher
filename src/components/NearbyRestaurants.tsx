// components/NearbyRestaurants.tsx
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState, useTransition } from "react";
import { fetchNearbyRestaurants, YelpBusiness } from "@/lib/yelp";
import RestaurantCard from "./RestaurantCard";
import { TbThumbDown, TbThumbUp } from "react-icons/tb";
import { useParams } from "next/navigation";

type Vote = {
  businessId: string;
  voteType: string;
}
export function NearbyRestaurants({ votes }: { votes: Vote[] }) {
  const params = useParams()

  const [index, setIndex] = useState(0);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const LIMIT = 50;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery<YelpBusiness[]>({
    queryKey: ["restaurants", coords?.latitude, coords?.longitude],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchNearbyRestaurants({
        latitude: coords!.latitude,
        longitude: coords!.longitude,
        offset: pageParam as number * LIMIT,
        limit: LIMIT,
      }),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    getNextPageParam: (lastPage, allPages) => {
      // Return the next page number if there are more items
      return lastPage.length === LIMIT ? allPages.length : undefined;
    },
    enabled: !!coords?.latitude && !!coords?.longitude,
  });

  // Flatten the pages array
  // and filter out cards they've already voted on
  const restaurants = (data?.pages.flat() || []).filter((restaurant) => !votes.find((vote) => vote.businessId === restaurant.id));

  useEffect(() => {
    window.navigator.geolocation.getCurrentPosition((position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setCoords({ latitude, longitude });
    });
  }, []);

  useEffect(() => {
    if (index >= restaurants.length - 5 && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [index, fetchNextPage, restaurants.length, isFetchingNextPage, hasNextPage])

  const [isPending, startTransition] = useTransition();

  if (isLoading) return <p>Loading nearby restaurants...</p>;
  if (isError) return <p>Failed to load restaurants.</p>;

  if (!restaurants || restaurants.length === 0) {
    return <p>No restaurants found.</p>;
  }
  const handleVote = (like: boolean) => {
    startTransition(() => {
      fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: params.id,
          businessId: restaurants[index].id,
          voteType: like ? 'like' : 'dislike',
        }),
      }).then(() => {
        setIndex(index + 1);
      })
    })
  }


  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <RestaurantCard restaurant={restaurants[index]} stack />
        <div className="flex gap-8 justify-center">
          <button onClick={() => handleVote(false)} disabled={isPending} className="bg-red-500/30 p-2 w-12 h-12 rounded-full text-white outline outline-offset-2 outline-red-500 flex items-center justify-center cursor-pointer hover:bg-red-500/50 transition hover:text-white">
            <TbThumbDown className="w-6 h-6 text-red-800" />
          </button>
          <button onClick={() => handleVote(true)} disabled={isPending} className="bg-green-500/30 p-2 w-12 h-12 rounded-full outline outline-offset-2 outline-green-500 flex items-center justify-center cursor-pointer hover:bg-green-500/50 transition text-green-800">
            <TbThumbUp className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div >
  );
}
