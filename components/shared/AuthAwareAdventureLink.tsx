"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredDashboardPath } from "@/lib/auth-client";

type AuthAwareAdventureLinkProps = {
  className?: string;
};

export default function AuthAwareAdventureLink({
  className = "primary-cta cursor-pointer",
}: AuthAwareAdventureLinkProps) {
  const router = useRouter();
  const [href, setHref] = useState("/auth");

  useEffect(() => {
    void Promise.resolve().then(() => {
      setHref(getStoredDashboardPath());
    });
  }, []);

  return (
    <Link
      href={href}
      onClick={(event) => {
        event.preventDefault();
        router.push(getStoredDashboardPath());
      }}
      className={className}
    >
      <span className="primary-cta-inner">Find your next adventure</span>
    </Link>
  );
}
