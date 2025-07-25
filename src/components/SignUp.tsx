"use client";

import { useActionState } from "react";
import { BsArrowRight } from "react-icons/bs";
import { useParams } from "next/navigation";

import { signUp } from "@/actions/users";
import Input from "@/components/Input";
import StaticMap from "@/components/StaticMap";

type FormState = {
  user: {
    id: string;
    name: string;
    joinedAt: string | null;
  } | null;
  error?: string;
} | null;

type Props = {
  session: {
    sessionId: string;
    latitude: number;
    longitude: number;
    locationName: string;
    category: string | null;
  };
  invitedBy: {
    id: string;
    name: string;
  };
};

export default function SignUp({ session, invitedBy }: Props) {
  const { id } = useParams();

  async function handleSubmit(prevState: FormState, formData: FormData) {
    try {
      const user = await signUp(id as string, formData.get("name") as string);
      return { user };
    } catch (error) {
      console.log(error);
      return { error: "Failed to sign up", user: null };
    }
  }

  const [, formAction, isPending] = useActionState<FormState, FormData>(
    handleSubmit,
    null
  );
  return (
    <form
      action={formAction}
      className="m-auto p-4 h-full w-full max-w-128 space-y-4 md:space-y-8 flex flex-col before:content-[''] after:content-[''] before:mt-auto after:mb-auto after:pb-4"
    >
      <header className="text-center">
        <h2 className="text-lg font-bold">
          Help {invitedBy.name} pick a {session.category ?? ''} restaurant near{" "}
        </h2>
        <h3 className="text-xl font-bold">{session.locationName}!</h3>
      </header>
      <StaticMap
        lat={session.latitude}
        lng={session.longitude}
        height={250}
        width={512}
        zoom={12}
        className="mb-2"
      />
      <p className="text-xs text-gray-600 text-center">
        Once you join, you&apos;ll be able to see and vote on restaurants near
        this location.
      </p>
      <div className="flex flex-col gap-2 w-full items-center sm:px-4">
        <Input
          label="Your Name"
          autoFocus
          id="name"
          name="name"
          required
          className="w-full"
        />
        <button
          disabled={isPending}
          type="submit"
          className="bg-blue-500 p-2 px-8 text-white text-center mt-3 hover:bg-blue-600 transition rounded-full flex gap-2 items-center cursor-pointer"
        >
          {isPending ? "Loading..." : "Let's Go!"}
          <BsArrowRight />
        </button>
      </div>
    </form>
  );
}
