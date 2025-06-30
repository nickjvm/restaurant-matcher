"use client";

import { useEffect, useState, useTransition } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoIosRepeat } from "react-icons/io";
import { TbThumbDown, TbThumbUp } from "react-icons/tb";
import { BsArrowLeft, BsEmojiFrown } from "react-icons/bs";
import { FaRegHourglass, FaRegThumbsUp } from "react-icons/fa";

import {
  fetchNearbyRestaurants,
  FetchNearbyRestaurantsResponse,
  YelpBusiness,
} from "@/lib/google-places";
import { socket } from "@/lib/socket";
import cn from "@/app/utils/cn";

import RestaurantCard from "@/components/RestaurantCard";
import ConfettiComponent from "@/components/Confetti";
import CardButton from "@/components/CardButton";
import GameCard from "@/components/GameCard";

import {
  Notification,
  useNotification,
} from "@/providers/NotificationProvider";
import GameHeader from "./GameHeader";

type User = {
  name: string;
  id: string;
};
type Vote = {
  businessId: string;
  voteType: string;
};

type Session = {
  sessionId: string;
  latitude: number;
  longitude: number;
  locationName: string;
};

const LIMIT = 50;

export function NearbyRestaurants({
  votes,
  user,
  otherUser,
  session,
  sessionUserCount: _sessionUserCount,
}: {
  votes: Vote[];
  user: User;
  session: Session;
  sessionUserCount: number;
  otherUser?: User;
}) {
  const params = useParams();
  const [match, setMatch] = useState<YelpBusiness | null>(null);
  const [index, setIndex] = useState(0);
  const [votingComplete, setVotingComplete] = useState(false);
  const [sessionUserCount, setSessionUserCount] = useState(_sessionUserCount);
  const { addNotification } = useNotification();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<FetchNearbyRestaurantsResponse>({
    queryKey: ["restaurants", session.latitude, session.longitude],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchNearbyRestaurants({
        latitude: session.latitude,
        longitude: session.longitude,
        offset: (pageParam as number) * LIMIT,
        limit: LIMIT,
        nextPageToken: pageParam as string | undefined,
      }),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    getNextPageParam: (lastPage) => {
      // Return the next page number if there are more items
      return lastPage.places.length === LIMIT
        ? lastPage.nextPageToken
        : undefined;
    },
  });

  // Flatten the pages array
  // and filter out cards they've already voted on
  const restaurants = (data?.pages.map((p) => p.places).flat() || []).filter(
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

      socket.on("joined", ({ roomSize }) => {
        setSessionUserCount(roomSize);
      });

      socket.on("notification", (notification: Notification) => {
        addNotification({
          message: notification.message,
          type: notification.type,
          duration: 5000,
        });
      });
    }

    function onDisconnect() {
      socket.removeAllListeners();
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

  if (isLoading)
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <GameCard
          title="Hang tight..."
          subtitle={`We're loading nearby restaurants`}
          description={`in ${session.locationName}`}
          image={
            <div className="bg-gray-200 rounded h-full p-4 flex items-center justify-center">
              <AiOutlineLoading3Quarters className="w-12 h-12 animate-spin text-gray-500" />
            </div>
          }
        />
      </div>
    );

  if (isError)
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <GameHeader buttonLeft={true} buttonRight={sessionUserCount < 2} />
        <div className="flex flex-col items-center gap-4 h-full justify-center">
          <GameCard
            title="Something went wrong"
            subtitle={`Unable to load nearby restaurants`}
            description={`in ${session.locationName}`}
            image={
              <div className="bg-gray-200 rounded h-full p-4 flex items-center justify-center">
                <BsEmojiFrown className="w-12 h-12 text-gray-500" />
              </div>
            }
            actions={[
              <Link
                key="retry"
                href="/"
                rel="noopener noreferrer"
                className="bg-blue-500 p-2 rounded text-white w-full text-center mt-3 hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <BsArrowLeft className="w-4 h-4" />
                Start Over
              </Link>,
            ]}
          />
        </div>
      </div>
    );

  if (votingComplete) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <GameHeader buttonLeft={true} buttonRight={sessionUserCount < 2} />

        <div className="flex flex-col items-center gap-4 h-full justify-center">
          <GameCard
            title="Voting complete!"
            subtitle={`You've voted on all available restaurants`}
            description={
              otherUser
                ? `Now we wait and see if ${otherUser?.name} likes any of the same restaurants as you!`
                : `Make sure you share this session with a friend so they can vote too!`
            }
            image={
              <div className="bg-green-800 rounded h-full p-4 flex items-center justify-center">
                <FaRegThumbsUp className="w-12 h-12  text-white" />
              </div>
            }
          />
        </div>
      </div>
    );
  }

  if (!restaurants || (restaurants.length === 0 && !isFetchingNextPage)) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <GameHeader buttonLeft={true} buttonRight={sessionUserCount < 2} />

        <div className="flex flex-col items-center gap-4 h-full justify-center">
          <GameCard
            title="No restaurants found"
            subtitle={`Either no restaurants were found nearby, or you've already voted on them all.`}
            description={
              otherUser
                ? `Now we wait and see if ${otherUser?.name} likes any of the same restaurants as you!`
                : `Make sure you share this session with a friend so they can vote too!`
            }
            image={
              <div className="bg-gray-200 rounded h-full p-4 flex items-center justify-center">
                <FaRegHourglass className="w-12 h-12  text-gray-500" />
              </div>
            }
          />
        </div>
      </div>
    );
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
            userId: user.id,
          });
          if (response.match) {
            socket.emit("match", {
              sessionId: params.id,
              business: response.business,
            });
            setMatch(response.business);
          } else {
            if (index + 1 >= restaurants.length) {
              setVotingComplete(true);
            } else {
              setIndex(index + 1);
            }
          }
        });
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <GameHeader buttonLeft={true} buttonRight={sessionUserCount < 2} />

      <div className="flex flex-col items-center gap-4 h-full justify-center">
        <div className="flex gap-8 justify-center">
          {match && (
            <>
              <ConfettiComponent />
              <h2 className="text-xl font-bold">🎉 You agreed! 🎉</h2>
            </>
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
