'use client'

import { YelpBusiness } from "@/lib/yelp";
import Link from "next/link";
import { useEffect } from "react";
import { BiFoodMenu, BiInfoCircle, BiInfoSquare } from "react-icons/bi";

type Props = {
    restaurant: YelpBusiness;
    stack?: boolean
}
export default function RestaurantCard({ restaurant, stack }: Props) {
    // useEffect(() => {
    //     async function fetchBusinessDetails() {
    //         const res = await fetch(`/api/restaurants/yelp/details?id=${restaurant.id}`);
    //         const data = await res.json();
    //         console.log(data)
    //     }

    //     fetchBusinessDetails()
    // }, [restaurant.id])

    return (
        <div className="relative">
            {stack && [2, 1].map((i) => {
                const offset = i * 5;
                return <div key={i} style={{ top: `${offset}px`, left: `${offset}px` }} className={`h-full bg-white absolute  p-4 border border-gray-300 rounded w-84 space-y-2`}></div>
            })}

            <div className="bg-white relative z-10 p-4 border border-gray-300 rounded shadow w-84 space-y-2">
                <div>
                    <div className="relative pt-[100%]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={restaurant.image_url} alt={restaurant.name} className="rounded absolute top-0 left-0 w-full h-full object-cover" />
                    </div>
                </div>
                <div>
                    <p className="font-semibold">{restaurant.name}</p>
                    <p className="text-sm text-gray-600">
                        {restaurant.location.address1}, {restaurant.location.city}
                    </p>
                    <p className="text-sm">
                        ⭐ {restaurant.rating} ({restaurant.review_count} reviews)
                    </p>
                    <div className="flex gap-2">

                        {restaurant.attributes.menu_url && (<p className="grow">
                            <Link
                                href={restaurant.attributes.menu_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 p-2 rounded text-white w-full text-center mt-3 hover:bg-blue-600 transition flex items-center justify-center gap-2"
                            >
                                <BiFoodMenu className="w-4 h-4" />
                                Menu</Link>
                        </p>)}
                        {restaurant.url && (<p className="grow">
                            <Link
                                href={restaurant.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 p-2 rounded text-white w-full text-center mt-3 hover:bg-blue-600 transition flex items-center justify-center gap-2"
                            >
                                <BiInfoCircle className="w-4 h-4" />
                                Details</Link>
                        </p>)}
                    </div>
                </div>
            </div>
        </div >
    );
}