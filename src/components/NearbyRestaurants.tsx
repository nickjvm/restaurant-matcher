// components/NearbyRestaurants.tsx
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState, useTransition } from "react";
import { fetchNearbyRestaurants, YelpBusiness } from "@/lib/yelp";
import RestaurantCard from "./RestaurantCard";
import { TbThumbDown, TbThumbUp } from "react-icons/tb";
import { useParams } from "next/navigation";
import SignUp from "./SignUp";
import ConfettiComponent from "./Confetti";

type User = {
  name: string;
  userId: string;
}
type Vote = {
  businessId: string;
  voteType: string;
}

type Session = {
  sessionId: string
  latitude: number
  longitude: number
}

const LIMIT = 50

export function NearbyRestaurants({ votes, user, session }: { votes: Vote[], user: User, session: Session }) {
  const params = useParams()
  const [match, setMatch] = useState<YelpBusiness | null>(null);
  const [index, setIndex] = useState(0);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery<YelpBusiness[]>({
    queryKey: ["restaurants", session.latitude, session.longitude],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchNearbyRestaurants({
        latitude: session.latitude,
        longitude: session.longitude,
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
  });

  // Flatten the pages array
  // and filter out cards they've already voted on
  const restaurants = (data?.pages.flat() || []).filter((restaurant) => !votes.find((vote) => vote.businessId === restaurant.id));

  useEffect(() => {
    if (index >= restaurants.length - 5 && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [index, fetchNextPage, restaurants.length, isFetchingNextPage, hasNextPage])

  const [isPending, startTransition] = useTransition();

  if (!user) return <SignUp />
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
      }).then(r => r.json()).then((response) => {
        if (response.match) {
          setMatch(response.business)
        } else {
          setIndex(index + 1);
        }
      })
    })
  }


  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        {match && <div className="flex gap-8 justify-center">
          <ConfettiComponent />
          Time to eat!
        </div>}
        <RestaurantCard restaurant={match ?? restaurants[index]} stack={!match} />
        {!match && (
          <div className="flex gap-8 justify-center">
            <button onClick={() => handleVote(false)} disabled={isPending} className="bg-red-500/30 p-2 w-12 h-12 rounded-full text-white outline outline-offset-2 outline-red-500 flex items-center justify-center cursor-pointer hover:bg-red-500/50 transition hover:text-white">
              <TbThumbDown className="w-6 h-6 text-red-800" />
            </button>
            <button onClick={() => handleVote(true)} disabled={isPending} className="bg-green-500/30 p-2 w-12 h-12 rounded-full outline outline-offset-2 outline-green-500 flex items-center justify-center cursor-pointer hover:bg-green-500/50 transition text-green-800">
              <TbThumbUp className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div >
  );
}
