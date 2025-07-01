"use client";

import Link from "next/link";
import { BiInfoCircle, BiMapPin } from "react-icons/bi";

import { getPhotoUrl, YelpBusiness } from "@/lib/google-places";

import GameCard from "@/components/GameCard";

type Props = {
  restaurant: YelpBusiness;
  stack?: boolean;
  className?: string;
  onDrag?: (direction: "left" | "right" | null) => void;
  onDragEnd?: (direction: "left" | "right" | null) => void;
  draggable?: boolean;
};

export default function RestaurantCard({
  restaurant,
  stack,
  className,
  onDrag,
  onDragEnd,
  draggable = true,
}: Props) {
  return (
    <GameCard
      draggable={draggable}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      key={restaurant.id}
      className={className}
      stack={stack}
      title={restaurant.name}
      photos={restaurant.photos.map((photo) =>
        getPhotoUrl({ photos: [photo] })
      )}
      category={restaurant.categories[0]?.title || ""}
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
        restaurant.attributes?.maps_url && (
          <Link
            href={restaurant.attributes.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 p-2 rounded text-white w-full text-center mt-3 hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <BiMapPin className="w-4 h-4" />
            View on Map
          </Link>
        ),
        restaurant.url && (
          <Link
            href={restaurant.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 p-2 rounded text-white w-full text-center mt-3 hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <BiInfoCircle className="w-4 h-4" />
            Visit Website
          </Link>
        ),
      ]}
    />
  );
}
