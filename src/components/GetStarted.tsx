"use client";

import { startSession } from "@/actions/sessions";
import { useActionState, useState } from "react";
import MapWithAdvancedMarker from "./MapWithAdvancedMarker";
import Input from "./Input";
import { BsArrowRight } from "react-icons/bs";

type FormState = {
  sessionId: string;
  error?: string;
} | null;

type User = {
  id: string;
  name: string;
  joinedAt: string | null;
} | null;

export default function GetStarted({ user }: { user?: User }) {
  const [locality, setLocality] = useState<string | null>(null);
  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  async function handleSubmit(prevState: FormState, formData: FormData) {
    if (!coords) {
      return { ...prevState, error: "Location access is required" };
    }

    try {
      const name = formData.get("name") as string;
      const result = await startSession({
        name,
        locationName: locality || "Nearby",
        latitude: coords.lat,
        longitude: coords.lng,
      });
      return result;
    } catch (error) {
      console.error("Failed to start session:", error);
      return { ...prevState, error: "Failed to start session" };
    }
  }

  const [, formAction, isPending] = useActionState<FormState, FormData>(
    handleSubmit as (
      state: FormState,
      payload: FormData
    ) => FormState | Promise<FormState>,
    null
  );
  return (
    <form
      action={formAction}
      className="m-auto p-4 h-full w-full max-w-128 flex flex-col items-center justify-center space-y-4"
    >
      <header className="text-center">
        <h2 className="text-lg font-bold">
          Find somewhere to eat near {!locality && "you!"}
        </h2>
        {locality && <h3 className="text-xl font-bold">{locality}!</h3>}
      </header>
      <MapWithAdvancedMarker
        onLocationChange={(location, locality) => {
          setCoords(location);
          setLocality(locality);
        }}
      />

      <div className="flex flex-col gap-2 w-full items-center px-4">
        <Input
          label="Your Name"
          autoFocus
          id="name"
          name="name"
          defaultValue={user?.name || ""}
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
