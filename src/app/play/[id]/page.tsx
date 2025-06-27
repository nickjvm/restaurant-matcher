import Link from "next/link";
import { notFound } from "next/navigation";
import { IoRepeat } from "react-icons/io5";
import { BsArrowLeft } from "react-icons/bs";

import {
  getMatch,
  getSession,
  getVotes,
  joinSession,
} from "@/actions/sessions";
import { fetchUser } from "@/actions/users";

import { NearbyRestaurants } from "@/components/NearbyRestaurants";
import SignUp from "@/components/SignUp";
import RestaurantCard from "@/components/RestaurantCard";
import ConfettiComponent from "@/components/Confetti";
import CardButton from "@/components/CardButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session } = await getSession(id);

  return {
    title: `Restaurant Matcher - Near ${session?.locationName || "You"}`,
    description: "Join a restaurant matching session",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, users } = await getSession(id);

  if (!session) {
    notFound();
  }

  const user = await fetchUser();

  const userInSession = users.some((u) => u?.id === user?.id);
  if (!userInSession && users.length >= 2) {
    return (
      <main className="p-6 h-full flex flex-col items-center justify-center">
        <div className="flex gap-4 flex-col justify-center items-center">
          <h2 className="text-xl font-bold">Matching in Progress...</h2>
          <p>Looks like this session is already paired up.</p>
          <div className="mt-4 relative z-10">
            <CardButton as={Link} href="/" className="px-8">
              <BsArrowLeft className="w-5 h-5" />
              Start Your Own Match Game
            </CardButton>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return <SignUp session={session} invitedBy={users[0]} />;
  } else if (!userInSession) {
    const sessionUser = await joinSession(id);
    users.push(sessionUser!);
  }

  const match = await getMatch(id);

  if (match) {
    return (
      <main className="p-6 h-full flex flex-col items-center justify-center">
        <div className="flex gap-4 flex-col justify-center items-center">
          <h2 className="text-xl font-bold">🎉 You agreed! 🎉</h2>

          <ConfettiComponent />
          <RestaurantCard restaurant={match} className="animate-emphasize" />
          <div className="mt-4 relative z-10">
            <CardButton as={Link} href="/" className="px-8">
              <IoRepeat className="w-5 h-5" />
              Try again?
            </CardButton>
          </div>
        </div>
      </main>
    );
  }

  const votes = await getVotes(id);

  return (
    <main className="p-6 h-full">
      <NearbyRestaurants
        votes={votes}
        user={user}
        otherUser={users.find((user) => user.id !== user?.id)}
        session={session}
        sessionUserCount={users.length}
      />
    </main>
  );
}
