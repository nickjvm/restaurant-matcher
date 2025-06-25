import { NearbyRestaurants } from '@/components/NearbyRestaurants';
import { getVotes } from '@/actions/sessions';

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  const votes = await getVotes(id);

  return (
    <main className="p-6 h-full">
      <NearbyRestaurants votes={votes} />
    </main>
  );
}
