"use client";

import Image from "next/image";
import Link from "next/link";
import { useApp } from "./AppContext";

export default function Header() {
  const { user, logout, cart, savedIds } = useApp();

  return (
    <header className="absolute top-0 left-0 z-50 w-full flex justify-center">
      <div className="p-5 lg:p-10 lg:py-5 w-full max-w-400 flex items-center justify-between">
        <Link href="/">
          <Image
            className="w-24 h-auto lg:w-28"
            src="/logo.svg"
            alt="Reisen Logo"
            height={32}
            width={113}
          />
        </Link>
        <nav className="flex items-center gap-4 lg:gap-8 text-one-liner-medium text-dark-base">
          <Link href="/experiences" className="hover:text-secondary transition-colors">
            Browse
          </Link>
          
          <Link href="/saved" className="relative hover:text-secondary transition-colors flex items-center gap-1">
            Saved
            {savedIds.length > 0 && (
              <span className="bg-secondary text-white-base text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {savedIds.length}
              </span>
            )}
          </Link>

          <Link href="/cart" className="relative hover:text-secondary transition-colors flex items-center gap-1">
            Cart
            {cart.length > 0 && (
              <span className="bg-secondary text-white-base text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cart.length}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {user.role === "customer" && (
                <Link href="/bookings" className="hover:text-secondary transition-colors">
                  Bookings
                </Link>
              )}
              <span className="hidden sm:inline text-body-dark">
                Hi, {user.firstName}
              </span>
              <button
                onClick={logout}
                className="hover:text-error transition-colors cursor-pointer font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-secondary transition-colors">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-secondary text-white-base px-4 py-1.5 rounded-full hover:bg-opacity-90 transition-all text-small-medium"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
