"use client";

import { startSession } from "@/actions/sessions";
import { useActionState, useEffect, useState } from "react";

type FormState = {
  sessionId: string;
  error?: string;
} | null;

type User = {
  userId: string;
  sessionId: string;
  name: string;
  joinedAt: string | null;
  isCreator: string | null;
} | null;

export default function GetStarted({ user }: { user?: User }) {
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        fetch("/api/location")
          .then((r) => r.json())
          .then(({ data }) => {
            setCoords({
              latitude: data.lat,
              longitude: data.lon,
            });
          });
      }
    );
  }, []);

  async function handleSubmit(prevState: FormState, formData: FormData) {
    if (!coords) {
      return { ...prevState, error: "Location access is required" };
    }

    try {
      const name = formData.get("name") as string;
      const result = await startSession({
        name,
        latitude: coords.latitude,
        longitude: coords.longitude,
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
      className="p-2 h-full flex items-center justify-center"
    >
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
              value={coords?.latitude || ""}
              id="latitude"
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="text"
              readOnly
              value={coords?.longitude || ""}
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
