"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-4">
        Manage Teams & Tasks
      </h1>

      <p className="text-gray-500 max-w-xl text-sm md:text-base mb-8">
        Organize projects, assign tasks, and track progress with a clean and efficient workflow designed for teams.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/signup")}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-md text-sm hover:bg-gray-800 transition"
        >
          Get Started
        </button>

        <button
          onClick={() => router.push("/login")}
          className="border border-gray-300 px-6 py-2.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
        >
          Login
        </button>
      </div>

      <p className="mt-10 text-xs text-gray-400">
        Simple • Secure • Team-focused
      </p>
    </div>
  );
}