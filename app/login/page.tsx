"use client";

import { useState } from "react";
import { useApp } from "../shared/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { login, user } = useApp();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (user) {
    router.push("/experiences");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/experiences");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(to_bottom,#cfbeea,#faf9f6_60%)] px-5 pt-24 lg:pt-32">
      <div className="w-full max-w-md border-2 border-primary rounded-[28px] bg-[url('/noise.svg')] bg-cover p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden backdrop-blur-md">
        <h1 className="text-section-title text-dark-base text-center mb-2">
          Welcome back
        </h1>
        <p className="text-body-medium text-body-dark text-center mb-8">
          Sign in to view your bookings and saved experiences
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-error text-small border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-small-medium text-dark-base">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="px-4 py-3 rounded-xl border border-body-off bg-white-base text-dark-base focus:outline-none focus:border-secondary text-body-regular transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-small-medium text-dark-base">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-4 py-3 rounded-xl border border-body-off bg-white-base text-dark-base focus:outline-none focus:border-secondary text-body-regular transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary-cta w-full cursor-pointer mt-4"
          >
            <span className="primary-cta-inner w-full py-3.5 block">
              {loading ? "Signing in..." : "Sign In"}
            </span>
          </button>
        </form>

        <p className="text-small text-body-dark text-center mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-secondary font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
