"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { savedApi } from "@/lib/api-client";
import { getStoredToken } from "@/lib/auth-client";

// Shared across every SaveButton on the page so a grid of cards triggers a
// single /api/saved request instead of one per card.
let savedSetPromise: Promise<Set<string>> | null = null;
function loadSavedSet(): Promise<Set<string>> {
  if (!savedSetPromise) {
    savedSetPromise = savedApi
      .list()
      .then((items) => new Set(items.map((e) => e.experienceId)))
      .catch(() => new Set<string>());
  }
  return savedSetPromise;
}

export default function SaveButton({
  experienceId,
  className = "",
  onSavedChange,
}: {
  experienceId: string;
  className?: string;
  onSavedChange?: (saved: boolean) => void;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!getStoredToken()) return;
    let cancelled = false;
    loadSavedSet().then((set) => {
      if (!cancelled) setSaved(set.has(experienceId));
    });
    return () => {
      cancelled = true;
    };
  }, [experienceId]);

  async function toggle(event: React.MouseEvent) {
    // Cards wrap the whole surface in a navigating link — don't follow it.
    event.preventDefault();
    event.stopPropagation();

    if (!getStoredToken()) {
      router.push(
        `/auth?next=${encodeURIComponent(`/experiences/${experienceId}`)}`,
      );
      return;
    }
    if (busy) return;

    setBusy(true);
    const next = !saved;
    setSaved(next);
    onSavedChange?.(next);
    try {
      if (next) await savedApi.save(experienceId);
      else await savedApi.unsave(experienceId);
      const set = await loadSavedSet();
      if (next) set.add(experienceId);
      else set.delete(experienceId);
    } catch {
      setSaved(!next);
      onSavedChange?.(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? "Remove from saved" : "Save experience"}
      className={`flex h-13 w-13 items-center justify-center rounded-full border border-body-off bg-primary-50/70 transition-colors hover:bg-primary-50 cursor-pointer ${className}`}
    >
      <Heart
        size={24}
        className={saved ? "fill-heart text-heart" : "text-dark-base"}
      />
    </button>
  );
}
