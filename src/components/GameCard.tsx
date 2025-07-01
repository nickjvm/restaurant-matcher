"use client";

import React from "react";

import cn from "@/app/utils/cn";
import PhotoGallery from "./PhotoGallery";

type Props = {
  photos: string[] | React.ReactNode[];
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode[];
  stack?: boolean;
  className?: string;
  category?: string;
};
export default function GameCard({
  photos,
  title,
  subtitle,
  description,
  actions,
  stack,
  className,
  category,
}: Props) {
  return (
    <div className={cn("relative", className)}>
      {stack &&
        [2, 1].map((i) => {
          const offset = i * 5;
          return (
            <div
              key={i}
              style={{ top: `${offset}px`, left: `${offset}px` }}
              className={`h-full bg-white absolute  p-4 border border-gray-300 rounded w-84 space-y-2`}
            ></div>
          );
        })}

      <div className="bg-white relative z-10 p-4 border border-gray-300 rounded shadow w-84 space-y-2">
        <div>
          <div className="relative">
            <PhotoGallery photos={photos} />
          </div>
        </div>
        <div>
          <p className="font-semibold text-lg">{title}</p>
          {category && <p className="mb-2 capitalize">{category}</p>}
          {subtitle && <p className=" text-gray-600">{subtitle}</p>}
          {description && <p className="">{description}</p>}

          <div className="flex gap-2">
            {actions?.map(
              (action, index) =>
                action && (
                  <div key={index} className="grow">
                    {action}
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
