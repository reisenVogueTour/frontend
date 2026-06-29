"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import HeaderAuthActions from "./headerAuthActions";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, logout } = useAuthSession();

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (pathname?.startsWith("/ai-recommendations")) return null;

  return (
    <header className="absolute top-0 left-0 z-50 w-full flex justify-center">
      <div className="p-5 lg:p-10 lg:py-5 w-full max-w-400">
        <nav className="flex items-center justify-between gap-4">
          <Link href="/">
            <Image
              className="w-24 h-auto lg:w-28 flex-none"
              src="/logo.svg"
              alt="Reisen Logo"
              height={32}
              width={113}
            />
          </Link>
          <HeaderAuthActions isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        </nav>
      </div>
    </header>
  );
}
