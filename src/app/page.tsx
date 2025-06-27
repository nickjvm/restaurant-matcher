import { fetchUser } from "@/actions/users";
import GetStarted from "@/components/GetStarted";
import IntroModal from "@/components/IntroModal";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Restaurant Matcher",
  description: "Find your next restaurant with friends",
};

export default async function Home() {
  const cookieStore = await cookies();
  const user = await fetchUser();

  return (
    <>
      {!cookieStore.get("shownIntroModal")?.value && <IntroModal />}
      <GetStarted user={user} />
    </>
  );
}
