'use client';

import { fetchCategories } from "@/lib/yelp";
import { useQuery } from "@tanstack/react-query";

export function Categories() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  if (isLoading) return <p>Loading categories...</p>;
  if (isError) return <p>Failed to load categories.</p>;

  if (!data || data.length === 0) {
    return <p>No categories found.</p>;
  }

  return (
    <ul className="space-y-4">
      {data.map((c) => (
        <li key={c.id} className="p-4 border rounded">
          <p className="font-semibold">{c.name}</p>
          <p className="text-sm text-gray-600">{c.description}</p>
        </li>
      ))}
    </ul>
  );
}