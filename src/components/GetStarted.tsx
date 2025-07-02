"use client";

import { useActionState, useEffect, useState } from "react";
import { BsArrowRight } from "react-icons/bs";

import { startSession } from "@/actions/sessions";
import MapWithAdvancedMarker from "@/components/MapWithAdvancedMarker";
import Input from "@/components/Input";
import { useNotification } from "@/providers/NotificationProvider";

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
  const [category, setCategory] = useState<string | null>(null);
  const { addNotification } = useNotification();
  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  async function handleSubmit(prevState: FormState, formData: FormData) {
    if (!coords) {
      return { ...prevState, error: "Location access is required" };
    }

    const name = formData.get("name") as string;
    const result = await startSession({
      name,
      category: category || '',
      locationName: locality || "Nearby",
      latitude: coords.lat,
      longitude: coords.lng,
    });

    if (result?.status === "error") {
      return { ...prevState, error: result.message || "Unknown error" };
    }
  }

  const [formState, formAction, isPending] = useActionState<
    FormState,
    FormData
  >(
    handleSubmit as (
      state: FormState,
      payload: FormData
    ) => FormState | Promise<FormState>,
    null
  );

  useEffect(() => {
    if (formState?.error) {
      addNotification({
        type: "error",
        message: formState.error,
        duration: 5000,
      });
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [formState]);
  return (
    <form
      action={formAction}
      className="m-auto p-4 h-full w-full max-w-128 flex flex-col items-center justify-center space-y-4 md:space-y-8"
    >
      <header className="text-center">
        <h2 className="text-lg font-bold leading-4">
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

      <div className="flex flex-col gap-2 w-full items-start px-4">
        <div className="flex gap-3 flex-wrap justify-center mb-4 text-sm">
          <div className="w-full text-center text-xs md:text-sm text-gray-600">Restaurant type:</div>
          <div className="flex flex-wrap justify-center gap-y-4 gap-x-2">
            <div>
              <input type="radio" id="all" name="category" value="" defaultChecked onChange={e => setCategory(e.target.value)} className="[&:checked+label]:bg-blue-500 [&:checked+label]:text-white hidden" />
              <label className="border border-blue-500 px-3 py-1 text-blue-500 rounded-full cursor-pointer transition" htmlFor="all">All</label>
            </div>
            <div>
              <input type="radio" id="fast-food" name="category" value="fast food" onChange={e => setCategory(e.target.value)} className="[&:checked+label]:bg-blue-500 [&:checked+label]:text-white hidden" />
              <label className="border border-blue-500 px-3 py-1 text-blue-500 rounded-full cursor-pointer transition" htmlFor="fast-food">Fast Food</label>
            </div>
            <div>
              <input type="radio" id="sit-down" name="category" value="sit down" onChange={e => setCategory(e.target.value)} className="[&:checked+label]:bg-blue-500 [&:checked+label]:text-white hidden" />
              <label className="border border-blue-500 px-3 py-1 text-blue-500 rounded-full cursor-pointer transition" htmlFor="sit-down">Sit Down</label>
            </div>
            <div>
              <input type="radio" id="carry-out" name="category" value="carryout" onChange={e => setCategory(e.target.value)} className="[&:checked+label]:bg-blue-500 [&:checked+label]:text-white hidden" />
              <label className="border border-blue-500 px-3 py-1 text-blue-500 rounded-full cursor-pointer transition" htmlFor="carry-out">Carryout</label>
            </div>
            <div>
              <input type="radio" id="bars" name="category" value="bar & brewery" onChange={e => setCategory(e.target.value)} className="[&:checked+label]:bg-blue-500 [&:checked+label]:text-white hidden" />
              <label className="border border-blue-500 px-3 py-1 text-blue-500 rounded-full cursor-pointer transition" htmlFor="bars">Bars & Breweries</label>
            </div>
            <div>
              <input type="radio" id="casual" name="category" value="casual" onChange={e => setCategory(e.target.value)} className="[&:checked+label]:bg-blue-500 [&:checked+label]:text-white hidden" />
              <label className="border border-blue-500 px-3 py-1 text-blue-500 rounded-full cursor-pointer transition" htmlFor="casual">Casual</label>
            </div>
            <div>
              <input type="radio" id="formal" name="category" value="formal" onChange={e => setCategory(e.target.value)} className="[&:checked+label]:bg-blue-500 [&:checked+label]:text-white hidden" />
              <label className="border border-blue-500 px-3 py-1 text-blue-500 rounded-full cursor-pointer transition" htmlFor="formal">Formal</label>
            </div>
            <div>
              <input type="radio" id="vegetarian" name="category" value="vegetarian" onChange={e => setCategory(e.target.value)} className="[&:checked+label]:bg-blue-500 [&:checked+label]:text-white hidden" />
              <label className="border border-blue-500 px-3 py-1 text-blue-500 rounded-full cursor-pointer transition" htmlFor="vegetarian">Vegetarian Options</label>
            </div>
            <div>
              <input type="radio" id="healthy" name="category" value="healthy" onChange={e => setCategory(e.target.value)} className="[&:checked+label]:bg-blue-500 [&:checked+label]:text-white hidden" />
              <label className="border border-blue-500 px-3 py-1 text-blue-500 rounded-full cursor-pointer transition" htmlFor="healthy">Healthy</label>
            </div>
          </div>
        </div>
        <Input
          label="Your Name"
          id="name"
          name="name"
          defaultValue={user?.name || ""}
          required
          className="w-full"
        />
        <button
          disabled={isPending}
          type="submit"
          className="self-center bg-blue-500 p-2 px-8 text-white text-center mt-3 hover:bg-blue-600 transition rounded-full flex gap-2 items-center cursor-pointer"
        >
          {isPending ? "Loading..." : "Let's Go!"}
          <BsArrowRight />
        </button>
      </div>
    </form>
  );
}
