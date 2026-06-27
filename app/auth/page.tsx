"use client";

import { useState } from "react";
import AuthForm, { type AuthMode } from "./auth-form";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("register");
  const isRegistering = mode === "register";

  return (
    <section className="flex min-h-screen justify-center bg-primary-50 px-5 pb-16 pt-32 lg:px-10 lg:pt-40">
      <div className="grid w-full max-w-400 items-center gap-10 lg:grid-cols-[1fr_520px]">
        <div className="max-w-2xl">
          <p className="text-one-liner-medium text-secondary">Welcome to Reisen</p>
          <h1 className="mt-4 text-hero text-dark-base">
            {isRegistering
              ? "Sign up to plan trips that feel local."
              : "Sign in to continue your next adventure."}
          </h1>
          <p className="mt-6 text-body-regular text-body-dark">
            {isRegistering
              ? "Create a traveler account to explore/save experiences, or join as a provider to list tours, guides, and hidden gems for review."
              : "Log back in to manage saved trips, bookings, provider onboarding, and the experiences you're building."}
          </p>
        </div>

        <AuthForm mode={mode} onModeChange={setMode} />
      </div>
    </section>
  );
}
