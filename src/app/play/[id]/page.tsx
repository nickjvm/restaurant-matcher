import { NearbyRestaurants } from "@/components/NearbyRestaurants";
import { getMatch, getSession, getVotes } from "@/actions/sessions";
import { fetchUser } from "@/actions/users";
import SignUp from "@/components/SignUp";
import { notFound } from "next/navigation";
import RestaurantCard from "@/components/RestaurantCard";
import ConfettiComponent from "@/components/Confetti";
import Link from "next/link";

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
          <RestaurantCard restaurant={match} />
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
