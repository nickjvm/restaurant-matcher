"use client";

import Link from "next/link";
import { BiFoodMenu, BiInfoCircle } from "react-icons/bi";

import { getPhotoUrl, GooglePhoto, YelpBusiness } from "@/lib/google-places";

import GameCard from "@/components/GameCard";
import { useEffect, useState } from "react";

type Props = {
  restaurant: YelpBusiness;
  stack?: boolean;
  className?: string;
};

export default function RestaurantCard({
  restaurant,
  stack,
  className,
}: Props) {
  const [photos, setPhotos] = useState<GooglePhoto[]>([]);
  const [summary, setSummary] = useState<string>("");
  useEffect(() => {
    fetch("/api/restaurants/google-places/detail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: restaurant.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.photos) {
          setPhotos(data.photos);
        }
        if (data.generativeSummary) {
          setSummary(data.generativeSummary.overview.text);
        }
      });
  }, [restaurant.id]);

  // console.log(photos.map((photo) => getPhotoUrl({ photos: [photo] })));
  return (
    <GameCard
      className={className}
      stack={stack}
      title={restaurant.name}
      image={restaurant.image_url ?? ""}
      summary={summary}
      subtitle={
        restaurant.location
          ? `${restaurant.location.address1}, ${restaurant.location.city}`
          : ""
      }
      description={
        restaurant.rating
          ? `⭐ ${restaurant.rating} (${restaurant.review_count} reviews)`
          : ""
      }
      actions={[
        // restaurant.attributes?.menu_url && (
        //   <Link
        //     href={restaurant.attributes.menu_url}
        //     target="_blank"
        //     rel="noopener noreferrer"
        //     className="bg-blue-500 p-2 rounded text-white w-full text-center mt-3 hover:bg-blue-600 transition flex items-center justify-center gap-2"
        //   >
        //     <BiFoodMenu className="w-4 h-4" />
        //     Menu
        //   </Link>
        // ),
        restaurant.url && (
          <Link
            href={restaurant.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 p-2 rounded text-white w-full text-center mt-3 hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <BiInfoCircle className="w-4 h-4" />
            Details
          </Link>
        ),
      ]}
    />
  );
}
