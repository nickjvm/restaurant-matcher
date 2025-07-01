"use client";

import { motion, useAnimationControls, useDragControls } from "framer-motion";
import { useRef } from "react";

export function DragCards() {
  return (
    <section className="relative grid min-h-screen w-full place-content-center overflow-hidden bg-neutral-950">
      <h2 className="relative z-0 text-[20vw] font-black text-neutral-800 md:text-[200px]">
        ASTRO
      </h2>
      <Cards />
      asdf
    </section>
  );
}

const Cards = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div className="relative inset-0 z-10 bg-red-500 p-4" ref={containerRef}>
      <Card>omg</Card>
    </div>
  );
};

type DragCardProps = {
  children: React.ReactNode;
  onDrag?: (direction: "left" | "right" | null) => void;
  onDragEnd?: (direction: "left" | "right" | null) => void;
  draggable?: boolean;
};

export const Card = ({
  children,
  onDrag,
  onDragEnd,
  draggable = true,
}: DragCardProps) => {
  const controls = useAnimationControls();
  const dragControls = useDragControls();

  return (
    <motion.div
      className="touch-none"
      drag={draggable}
      dragControls={dragControls}
      dragListener={false}
      initial={{ x: 0, y: 0 }} // Start 100px to the right
      animate={controls} // Animate back to the initial x position (0)
      transition={{ duration: 0.3 }} // Add a transition duration
      dragElastic={0.2}
      onPointerDown={(e) => {
        if (!(e.target as HTMLElement).closest(".no-drag")) {
          dragControls.start(e);
        }
        e.stopPropagation();
      }}
      // dragConstraints={{
      //   left: -200, // Allow dragging to the left
      //   right: 200, // Allow dragging to the right
      //   top: -100, // Allow dragging upwards
      //   bottom: 100, // Allow dragging downwards
      // }}
      onDrag={(event, info) => {
        if (!draggable) {
          return;
        }
        if (info.offset.x > 100) {
          onDrag?.("right");
        } else if (info.offset.x < -100) {
          onDrag?.("left");
        } else {
          onDrag?.(null); // No significant drag
        }
      }}
      onDragEnd={(event, info) => {
        if (!draggable) {
          return;
        }
        if (info.offset.x > 100 || info.velocity.x > 500) {
          onDragEnd?.("right"); // Call your onSwipeRight handler here
        } else if (info.offset.x < -100 || info.velocity.x < -500) {
          onDragEnd?.("left"); // Call your onSwipeLeft handler here
        } else {
          // Not enough movement to count as a swipe
          onDragEnd?.(null);
          controls.start({ x: 0, y: 0 }); // Reset position
        }
      }}
    >
      {children}
    </motion.div>
  );
};

export default Card;
