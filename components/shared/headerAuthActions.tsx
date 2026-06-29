"use client";

import Link from "next/link";
import { getDashboardPath } from "@/lib/auth-client";
import { usePathname } from "next/navigation";

interface HeaderAuthActionsProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const headerBtnBase =
  "bg-dark-base text-white-base rounded-2xl px-5 py-2 text-sm md:text-lg active:border-t-3 active:border-x-3 border-2 border-primary-50/10 text-button translate-y-0 active:translate-y-1 transition-transform duration-150 hover:text-dark-base hover:bg-primary-50 cursor-pointer";

export default function HeaderAuthActions({
  isLoggedIn,
  onLogout,
}: HeaderAuthActionsProps) {
  const DASHBOARD_PATH = getDashboardPath();
  const pathname = usePathname();

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        {pathname !== DASHBOARD_PATH && (
          <Link
            href={getDashboardPath()}
            className={`${headerBtnBase} bg-primary text-dark-base! hover:bg-primary-50 border-2 border-secondary/10`}
          >
            Dashboard
          </Link>
        )}

        {pathname !== "/auth" && (
          <button
            type="button"
            onClick={onLogout}
            className={`${headerBtnBase}`}
          >
            Logout
          </button>
        )}
      </div>
    );
  }

  return pathname !== "/auth" ? (
    <Link href="/auth" className={headerBtnBase}>
      Log in
    </Link>
  ) : null;
}
