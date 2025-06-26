"use client";

import { useEffect, useState, useTransition } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IoIosRepeat } from "react-icons/io";
import { TbThumbDown, TbThumbUp } from "react-icons/tb";

import { fetchNearbyRestaurants, YelpBusiness } from "@/lib/yelp";
import { socket } from "@/lib/socket";

import cn from "@/app/utils/cn";

import RestaurantCard from "@/components/RestaurantCard";
import SignUp from "@/components/SignUp";
import ConfettiComponent from "@/components/Confetti";
import CardButton from "@/components/CardButton";
import { useNotification } from "@/providers/NotificationProvider";

type User = {
  name: string;
  userId: string;
};
type Vote = {
  businessId: string;
  voteType: string;
};

type Session = {
  sessionId: string;
  latitude: number;
  longitude: number;
};

const LIMIT = 50;

export function NearbyRestaurants({
  votes,
  user,
  session,
}: {
  votes: Vote[];
  user: User;
  session: Session;
}) {
  const params = useParams();
  const [match, setMatch] = useState<YelpBusiness | null>(null);
  const [index, setIndex] = useState(0);
  const { addNotification } = useNotification();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<YelpBusiness[]>({
    queryKey: ["restaurants", session.latitude, session.longitude],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchNearbyRestaurants({
        latitude: session.latitude,
        longitude: session.longitude,
        offset: (pageParam as number) * LIMIT,
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
  const restaurants = (data?.pages.flat() || []).filter(
    (restaurant) => !votes.find((vote) => vote.businessId === restaurant.id)
  );

  useEffect(() => {
    if (index >= restaurants.length - 5 && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [
    index,
    fetchNextPage,
    restaurants.length,
    isFetchingNextPage,
    hasNextPage,
  ]);

  useEffect(() => {
    function onConnect() {
      socket.on("matched", (business: YelpBusiness) => {
        setMatch(business);
      });

      socket.emit("join", { user, sessionId: params.id });

      socket.on("joined", (message) => {
        console.log("User joined:", message.user?.name);
        addNotification({
          message: `${message.user?.name} has joined the session!`,
          type: "info",
          duration: 5000,
        });
      });
    }

    function onDisconnect() {
      socket.off("matched");
      socket.off("joined");
    }

    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      onDisconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, user]);

  const [isPending, startTransition] = useTransition();

  if (!user) return <SignUp />;
  if (isLoading) return <p>Loading nearby restaurants...</p>;
  if (isError) return <p>Failed to load restaurants.</p>;

  if (!restaurants || restaurants.length === 0) {
    return <p>No restaurants found.</p>;
  }

  const handleVote = (like: boolean) => {
    startTransition(() => {
      fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: params.id,
          businessId: restaurants[index].id,
          voteType: like ? "like" : "dislike",
        }),
      })
        .then((r) => r.json())
        .then((response) => {
          socket.emit("vote", {
            sessionId: params.id,
            businessId: restaurants[index].id,
            vote: like ? "like" : "dislike",
            userId: user.userId,
          });
          if (response.match) {
            socket.emit("match", {
              sessionId: params.id,
              business: response.business,
            });
            setMatch(response.business);
          } else {
            setIndex(index + 1);
          }
        });
    });
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-8 justify-center">
          {match && (
            <>
              <ConfettiComponent />
              <h2 className="text-xl font-bold">🎉 You agreed! 🎉</h2>
            </>
          )}
          {!match && (
            <h2 className="text-xl font-bold">What do you think about...</h2>
          )}
        </div>
        <RestaurantCard
          className={cn(match && "animate-emphasize")}
          restaurant={match ?? restaurants[index]}
          stack={!match}
        />
        <div className="mt-4 relative z-10">
          {!match && (
            <div className="flex gap-8 justify-center">
              <CardButton
                onClick={() => handleVote(false)}
                disabled={isPending}
                className="bg-red-500/30 hover:bg-red-500/50 text-red-800 outline-red-500"
              >
                <TbThumbDown className="w-6 h-6" />
              </CardButton>
              <CardButton
                onClick={() => handleVote(true)}
                disabled={isPending}
                className="bg-green-500/30 hover:bg-green-500/50 outline-green-500 text-green-800"
              >
                <TbThumbUp className="w-6 h-6" />
              </CardButton>
            </div>
          )}
          {match && (
            <CardButton as={Link} href="/" className="px-8">
              <IoIosRepeat className="w-5 h-5" />
              Try again?
            </CardButton>
          )}
        </div>
      </div>
    </div>
  );
}
