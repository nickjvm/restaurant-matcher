"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { IoIosShareAlt } from "react-icons/io";

import { socket } from "@/lib/socket";
import { useParams } from "next/navigation";
export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  useEffect(() => {
    function onConnect() {
      console.log("Connected to socket server");
      socket.emit("join", params.id);
      socket.on("joined", console.log);
      socket.on("voted", ({ vote, businessId, userId }) => {
        console.log(`User ${userId} voted ${vote} for business ${businessId}`);
      });
    }

    if (socket.connected) {
      onConnect();
    }

    function onDisconnect() {
      socket.off("joined");
      socket.off("voted");
    }
    socket.on("disconnect", onDisconnect);
    socket.on("connect", onConnect);

    return () => {
      onDisconnect();
    };
  });
  function share() {
    navigator
      .share({
        title: "I'm Hungry",
        text: "Lets figure out where to eat tonight!",
        url: window.location.href,
      })
      .catch(() => {
        // share cancelled
      });
  }
  return (
    <main className="h-full">
      <div className="fixed top-0 flex justify-between items-center w-full">
        <Link
          href="/"
          className="p-4 inline-block  opacity-30 hover:opacity-100 transition"
        >
          <BsArrowLeft className="w-6 h-6" />
        </Link>
        <button
          onClick={share}
          className="p-4 inline-block  opacity-30 hover:opacity-100 transition cursor-pointer"
        >
          <IoIosShareAlt className="w-6 h-6" />
        </button>
      </div>
      {children}
    </main>
  );
}
