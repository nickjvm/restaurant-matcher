import cn from "@/app/utils/cn";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { IoPersonAdd } from "react-icons/io5";

type Props = {
  buttonLeft?: boolean;
  buttonRight?: boolean;
};

export default function GameHeader({ buttonLeft, buttonRight }: Props) {
  const share = () => {
    navigator
      .share({
        title: "I'm Hungry",
        text: "Lets figure out where to eat tonight!",
        url: window.location.href,
      })
      .catch(() => {
        // share cancelled
      });
  };
  return (
    <div className="flex justify-between items-center -mx-6 -mt-6 self-stretch">
      <div>
        {buttonLeft && (
          <Link
            href="/"
            className={cn(
              "block p-4 opacity-30 transition relative group",
              "hover:opacity-100 focus:opacity-100 hover:text-red-800 focus:text-red-800"
            )}
          >
            <BsArrowLeft className="w-6 h-6" />
            <span
              className={cn(
                "absolute right-2 translate-x-full sm:translate-x-0 top-1/2 sm:opacity-0 -translate-y-1/2 transition",
                "group-hover:translate-x-full group-hover:opacity-100",
                "group-focus:translate-x-full group-focus:opacity-100"
              )}
            >
              Exit
            </span>
          </Link>
        )}
      </div>
      <div>
        {buttonRight && (
          <button
            onClick={share}
            className={cn(
              "p-4 inline-block opacity-30 transition cursor-pointer relative group",
              "hover:opacity-100 focus:opacity-100 hover:text-blue-800 focus:text-blue-800"
            )}
          >
            <IoPersonAdd className="w-6 h-6" />
            <span
              className={cn(
                "absolute -translate-x-full sm:translate-x-0 left-2 top-1/2 sm:opacity-0 -translate-y-1/2 transition",
                "group-hover:-translate-x-full group-hover:opacity-100",
                "group-focus:-translate-x-full group-focus:opacity-100"
              )}
            >
              Invite
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
