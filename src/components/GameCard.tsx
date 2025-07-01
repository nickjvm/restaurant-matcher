"use client";

import React from "react";

import cn from "@/app/utils/cn";
import PhotoGallery from "@/components/PhotoGallery";
import DragCard from "@/components/DragCard";

type Props = {
  photos: string[] | React.ReactNode[];
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode[];
  stack?: boolean;
  className?: string;
  category?: string;
  onDrag?: (direction: "left" | "right" | null) => void;
  onDragEnd?: (direction: "left" | "right" | null) => void;
  draggable?: boolean;
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
  onDrag,
  onDragEnd,
  draggable = true,
}: Props) {
  return (
    <div className="relative">
      {stack &&
        [2, 1].map((i) => {
          const offset = i * 5;
          return (
            <div
              key={i}
              style={{ top: `${offset}px`, left: `${offset}px` }}
              className={`h-full bg-white absolute  p-4 border border-gray-300 rounded w-84 space-y-2`}
            >
              <div className="w-full bg-gray-200 rounded aspect-square animate-pulse"></div>
              <div className="w-[75%] bg-gray-200 rounded h-5 animate-pulse"></div>
              <div className="w-[20%] bg-gray-200 rounded h-4 mb-4 animate-pulse"></div>
              <div className="w-[80%] bg-gray-200 rounded h-4 animate-pulse"></div>
              <div className="w-[35%] bg-gray-200 rounded h-4 animate-pulse"></div>
              <div className="flex gap-2 mt-3">
                <div className="grow h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="grow h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          );
        })}
      <DragCard onDrag={onDrag} onDragEnd={onDragEnd} draggable={draggable}>
        <div
          className={cn(
            "bg-white relative z-10 p-4 border border-gray-300 rounded w-84 space-y-2 opacity",
            !stack && "shadow",
            onDrag && "cursor-grab",
            className
          )}
        >
          <div>
            <div className="relative no-drag">
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
      </DragCard>
    </div>
  );
}
