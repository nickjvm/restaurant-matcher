"use client";

import cn from "@/app/utils/cn";
import React from "react";

type Props = {
  image: string | React.ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode[];
  stack?: boolean;
  className?: string;
};
export default function GameCard({
  image,
  title,
  subtitle,
  description,
  actions,
  stack,
  className,
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
          <div className="relative pt-[100%]">
            {typeof image === "string" ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={title}
                  className="rounded absolute top-0 left-0 w-full h-full object-cover"
                />
              </>
            ) : (
              <div className="rounded absolute top-0 left-0 w-full h-full object-cover">
                {image}
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          {description && <p className="text-sm">{description}</p>}

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
