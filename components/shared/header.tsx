"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearAuthSession,
  getStoredToken,
  subscribeToAuthSessionChange,
} from "@/lib/auth-client";

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    function syncAuthState() {
      setIsLoggedIn(Boolean(getStoredToken()));
    }

    void Promise.resolve().then(() => {
      syncAuthState();
    });

    return subscribeToAuthSessionChange(syncAuthState);
  }, []);

  function handleLogout() {
    clearAuthSession();
    setIsLoggedIn(false);
    router.push("/");
  }

  return (
    <header className="absolute top-0 left-0 z-50 w-full flex justify-center">
      <div className="p-5 lg:p-10 lg:py-5 w-full max-w-400">
        <nav className="flex items-center justify-between gap-4">
          <Link href="/">
            <Image
              className="w-24 h-auto lg:w-28"
              src="/logo.svg"
              alt="Reisen Logo"
              height={32}
              width={113}
            />
          </Link>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-dark-base shadow-sm transition hover:bg-primary/90"
              >
                Logout
              </button>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
