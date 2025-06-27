"use client";

import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
} from "@headlessui/react";
import { useState } from "react";

export default function IntroModal() {
  // The open/closed state lives outside of the `Dialog` and is managed by you
  const [isOpen, setIsOpen] = useState(true);

  async function handleSubmit() {
    await fetch("/api/start", { method: "POST" });
    setIsOpen(false);
  }

  return (
    /*
      Pass `isOpen` to the `open` prop, and use `onClose` to set
      the state back to `false` when the user clicks outside of
      the dialog or presses the escape key.
    */
    <Dialog
      open={isOpen}
      onClose={handleSubmit}
      className="relative z-50 transition duration-300 ease-out data-closed:opacity-0"
      transition
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/50">
        <Transition
          appear
          show={isOpen}
          enter="transition duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition duration-300"
          leaveFrom="scale-100"
          leaveTo="scale-95"
        >
          <DialogPanel className="max-w-[750px] space-y-4 md:space-y-8 bg-white p-4 rounded-lg max-h-full overflow-auto">
            <div className=" flex flex-col items-center text-center">
              <DialogTitle className="font-bold text-lg">
                🍽️ Tired of the &quot;Where should we eat?&quot; debate?
              </DialogTitle>
              <Description className="text-gray-500">
                Let&apos;s solve it together! Here&apos;s how it works:
              </Description>
            </div>
            <ol className="space-y-4 md:px-4">
              <li>
                <strong className="block">📍 Pick your spot</strong> Drop a pin
                anywhere on the map to search nearby restaurants.
              </li>
              <li>
                <strong className="block">🎯 Start your session</strong> Enter
                your name and we&apos;ll create a personalized matching room.
              </li>
              <li>
                <strong className="block">🔗 Invite a friend</strong> Share your
                unique link – they&apos;ll see the exact same restaurants you
                do.
              </li>
              <li>
                <strong className="block">👍 Vote and match</strong>
                Both vote on restaurants you&apos;d want to try. We&apos;ll
                notify you when you both say &quot;yes!&quot;
              </li>
              <li>
                <strong className="block">🎉 Dinner is decided</strong>
                Head out and enjoy your mutual pick – no more decision fatigue!
              </li>
            </ol>
            <div className="flex gap-4 items-center justify-center">
              <button
                type="button"
                className="bg-blue-500 p-2 px-8 text-white text-center mt-3 hover:bg-blue-600 transition rounded-full flex gap-2 items-center cursor-pointer"
                onClick={handleSubmit}
              >
                Got it
              </button>
            </div>
          </DialogPanel>
        </Transition>
      </div>
    </Dialog>
  );
}
