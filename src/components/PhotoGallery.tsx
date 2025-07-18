"use client";

import "swiper/css";

import Image from "next/image";
import React, { isValidElement, useState } from "react";
import { FaImage } from "react-icons/fa";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import cn from "@/app/utils/cn";

function FallbackImage() {
  return (
    <div className="bg-blue-200 absolute top-0 left-0 right-0 rounded h-full p-4 flex items-center justify-center">
      <FaImage className="w-12 h-12  text-blue-900" />
    </div>
  );
}

type PhotoProps = {
  src: string | React.ReactNode;
  alt: string;
  priority?: boolean;
};
function Photo({ src, alt, priority }: PhotoProps) {
  const [hasError, setHasError] = useState(false);
  if (typeof src === "string") {
    return (
      <div className="relative w-full h-full">
        {hasError ? (
          <FallbackImage />
        ) : (
          <Image
            src={src}
            alt={alt}
            priority={priority}
            onError={() => setHasError(true)}
            width={400}
            height={400}
            className="object-cover h-full"
            unoptimized
          />
        )}
      </div>
    );
  } else if (isValidElement(src)) {
    return (
      <div
        className=" aspect-square absolute top-0 left-0 w-full h-full object-cover"
        aria-label={alt}
      >
        {src}
      </div>
    );
  }

  return <FallbackImage />;
}

type PaginatorProps = {
  swiper?: SwiperRef["swiper"];
  count: number;
  index: number;
};
function Paginator({ count, index, swiper }: PaginatorProps) {
  return (
    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/75 z-10 p-2 rounded-full items-center h-6">
      {Array.from({ length: count }, (_, i) => (
        <button
          type="button"
          onClick={() => {
            swiper?.slideTo(i);
          }}
          key={i}
          className={cn(
            "w-1 h-1 bg-gray-300 transition-all duration-300",
            index === i && "w-2 h-2",
            `rounded-full`
          )}
        >
          <span className="sr-only">Slide {i + 1}</span>
        </button>
      ))}
    </div>
  );
}

type PhotoGalleryProps = {
  photos: string[] | React.ReactNode[];
};

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [index, setIndex] = useState(0);
  const swiperRef = React.useRef<SwiperRef | null>(null);
  if (!photos.length) {
    return (
      <div className="flex items-center justify-center h-full aspect-square">
        <FallbackImage />
      </div>
    );
  }
  return (
    <div>
      <Swiper
        ref={swiperRef}
        spaceBetween={0}
        slidesPerView={1}
        onSlideChange={(swiper) => setIndex(swiper.activeIndex)}
        className="relative pt-[100%] rounded-lg"
      >
        {photos.map((photo, i) => (
          <SwiperSlide key={i} className="overflow-hidden h-full aspect-square">
            <Photo
              src={photo}
              alt={`Photo ${index + 1}`}
              priority={index === i}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {photos.length > 1 && (
        <Paginator
          count={photos.length}
          index={index}
          swiper={swiperRef.current?.swiper}
        />
      )}
    </div>
  );
}
