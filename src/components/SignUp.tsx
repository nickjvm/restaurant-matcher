"use client";

import { useActionState } from "react";
import { signUp } from "@/actions/users";
import { useParams } from "next/navigation";

type FormState = {
  user: {
    id: string;
    name: string;
    joinedAt: string | null;
  } | null;
  error?: string;
} | null;

export default function SignUp() {
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
      className="p-2 h-full flex items-center justify-center"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name">Your Name</label>
          <input
            autoFocus
            id="name"
            required
            name="name"
            type="text"
            className="border border-gray-300 rounded p-2 w-full"
          />
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
