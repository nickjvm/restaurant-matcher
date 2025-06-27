import { fetchUser } from "@/actions/users";
import GetStarted from "@/components/GetStarted";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurant Matcher",
  description: "Find your next restaurant with friends",
};

export default async function Home() {
  const user = await fetchUser();
  return <GetStarted user={user} />;
}
