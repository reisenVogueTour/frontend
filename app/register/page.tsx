"use client";

import { useState } from "react";
import { useApp, UserRole } from "../shared/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const { register, user } = useApp();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
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

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    try {
      await register(firstName, lastName, email, password, role);
      router.push("/experiences");
    } catch (err: any) {
      setError(err.message || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(to_bottom,#cfbeea,#faf9f6_60%)] px-5 pt-24 lg:pt-32">
      <div className="w-full max-w-lg border-2 border-primary rounded-[28px] bg-[url('/noise.svg')] bg-cover p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden backdrop-blur-md">
        <h1 className="text-section-title text-dark-base text-center mb-2">
          Create Account
        </h1>
        <p className="text-body-medium text-body-dark text-center mb-8">
          Join Reisen and start matches with local experiences
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-error text-small border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="firstName" className="text-small-medium text-dark-base">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ada"
                className="px-4 py-3 rounded-xl border border-body-off bg-white-base text-dark-base focus:outline-none focus:border-secondary text-body-regular transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="lastName" className="text-small-medium text-dark-base">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Lovelace"
                className="px-4 py-3 rounded-xl border border-body-off bg-white-base text-dark-base focus:outline-none focus:border-secondary text-body-regular transition-all"
              />
            </div>
          </div>

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
              placeholder="Min. 8 characters"
              className="px-4 py-3 rounded-xl border border-body-off bg-white-base text-dark-base focus:outline-none focus:border-secondary text-body-regular transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-small-medium text-dark-base">I am a...</span>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  role === "customer"
                    ? "border-secondary bg-primary-50 text-secondary font-bold"
                    : "border-body-off bg-white-base text-body-dark hover:border-primary"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === "customer"}
                  onChange={() => setRole("customer")}
                  className="sr-only"
                />
                Customer
              </label>
              <label
                className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  role === "provider"
                    ? "border-secondary bg-primary-50 text-secondary font-bold"
                    : "border-body-off bg-white-base text-body-dark hover:border-primary"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="provider"
                  checked={role === "provider"}
                  onChange={() => setRole("provider")}
                  className="sr-only"
                />
                Tour Provider
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary-cta w-full cursor-pointer mt-4"
          >
            <span className="primary-cta-inner w-full py-3.5 block">
              {loading ? "Registering..." : "Register"}
            </span>
          </button>
        </form>

        <p className="text-small text-body-dark text-center mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-secondary font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
