import { NearbyRestaurants } from '@/components/NearbyRestaurants';

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Nearby Restaurants</h1>
      <NearbyRestaurants />
    </main>
  );
}
