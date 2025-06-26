import Link from "next/link";
import { notFound } from "next/navigation";
import { IoRepeat } from "react-icons/io5";

import { getMatch, getSession, getVotes } from "@/actions/sessions";
import { fetchUser } from "@/actions/users";

import { NearbyRestaurants } from "@/components/NearbyRestaurants";
import SignUp from "@/components/SignUp";
import RestaurantCard from "@/components/RestaurantCard";
import ConfettiComponent from "@/components/Confetti";
import CardButton from "@/components/CardButton";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  const { session, users } = await getSession(id);

  if (!session) {
    notFound();
  }

  const user = await fetchUser(session.sessionId);

  if (!user) {
    if (users.length >= 2) {
      // session is full
      return (
        <main className="p-6 h-full pt-[56px]">
          <div className="flex gap-8 flex-col justify-center items-center">
            <h2 className="text-center">Matching in Progress...</h2>
            <Link href="/">Start Your Own</Link>
          </div>
        </main>
      );
    }
    return <SignUp />;
  }

  const match = await getMatch(id);

  if (match) {
    return (
      <main className="p-6 h-full pt-[56px]">
        <div className="flex gap-8 flex-col justify-center items-center">
          <h2 className="text-center">It&apos;s a match!</h2>
          <ConfettiComponent />
          <RestaurantCard restaurant={match} className="animate-emphasize" />
          <CardButton as={Link} href="/" className="px-8">
            <IoRepeat className="w-5 h-5" />
            Try again?
          </CardButton>
        </div>
      </main>
    );
  }

  const votes = await getVotes(id);

  return (
    <main className="p-6 h-full">
      <NearbyRestaurants votes={votes} user={user} session={session} />
    </main>
  );
}
