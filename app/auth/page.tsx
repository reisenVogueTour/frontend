"use client";

import { useState } from "react";
import AuthForm, { type AuthMode } from "./auth-form";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("register");
  const isRegistering = mode === "register";

  return (
    <section className="flex min-h-[100svh] justify-center bg-[linear-gradient(to_top,#cfbeea,#f9fafb_80%)] px-4 pb-20 pt-24 sm:px-6 md:px-8 lg:px-10 lg:pb-24 lg:pt-28">
      <div className="grid w-full max-w-400 items-start gap-8 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:items-center">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <p className="text-one-liner-medium text-secondary">Welcome to Reisen</p>
          <h1 className="mt-4 text-[42px] leading-[0.96] font-bold font-display text-dark-base sm:text-hero">
            {isRegistering
              ? "Sign up to plan trips that feel local."
              : "Sign in to continue your next adventure."}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-body-regular text-body-dark lg:mx-0 lg:mt-6">
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
