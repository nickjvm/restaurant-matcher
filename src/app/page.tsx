import { fetchUser } from "@/actions/users";
import GetStarted from "@/components/GetStarted";

export default async function Home() {
  const user = await fetchUser();
  return <GetStarted user={user} />;
}
