"use client";

import { startSession } from "@/actions/sessions";
import { useActionState, useState } from "react";
import MapPicker from "./MapPicker";

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
      className="p-2 h-full flex flex-col items-center justify-center"
    >
      <MapPicker onLocationSelect={(location) => setCoords(location)} />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name">Your Name</label>
          <input
            autoFocus
            id="name"
            defaultValue={user?.name || ""}
            required
            name="name"
            type="text"
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="latitude">Latitude</label>
            <input
              type="text"
              readOnly
              value={coords?.lat || ""}
              id="latitude"
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="text"
              readOnly
              value={coords?.lng || ""}
              id="longitude"
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
        </div>
        <button
          disabled={isPending}
          type="submit"
          className="bg-blue-500 p-2 rounded text-white w-full text-center mt-3 hover:bg-blue-600 transition"
        >
          {isPending ? "Loading..." : "Let's Go!"}
        </button>
      </div>
    </form>
  );
}
