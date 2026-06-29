"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, MapPin } from "lucide-react";
import { getStoredToken } from "@/lib/auth-client";
import { clearRecommendations } from "@/lib/recommendations";

type DestinationExperienceModalProps = {
  slug: string;
  destinationName: string;
  onClose: () => void;
};

export default function DestinationExperienceModal({
  slug,
  destinationName,
  onClose,
}: DestinationExperienceModalProps) {
  const router = useRouter();

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const aiPath = `/ai-recommendations?destination=${encodeURIComponent(slug)}`;
  const resultsPath = `/destinations/${slug}`;

  function handleYes() {
    if (getStoredToken()) {
      router.push(aiPath);
    } else {
      router.push(`/auth?next=${encodeURIComponent(aiPath)}`);
    }
  }

  function handleNo() {
    clearRecommendations();
    router.push(resultsPath);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-base/50 p-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={`Plan your trip to ${destinationName}`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        className="modal-show-animation flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white-base p-5 outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between">
          <span className="flex items-center gap-1.5 text-extra-small text-secondary">
            <MapPin size={13} /> {destinationName}
          </span>

          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-dark-base transition-colors hover:bg-primary cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body — the two paths */}
        <div className="flex flex-col gap-5 px-6 py-6">
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-primary-50 px-5 py-6 text-center border border-primary">
            <h3 className="flex items-center gap-1.5 text-section-inner-title text-dark-base">
              Want AI-powered picks tailored to you?
            </h3>
            <p className="text-body-regular text-body-dark">
              Helps you match available experiences to your interests and
              reduces the hassle involved in planning a trip.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleYes}
              className="primary-cta cursor-pointer"
            >
              <span className="primary-cta-inner block w-full text-dark-base">
                Yes, recommend for me
              </span>
            </button>
            <button
              type="button"
              onClick={handleNo}
              className="rounded-[64px] px-8 py-3.5 text-button text-secondary transition-colors hover:bg-primary-50 lg:px-10 cursor-pointer"
            >
              No thanks, see all experiences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useDestinationModal() {
  const [target, setTarget] = useState<{ slug: string; name: string } | null>(
    null,
  );

  const open = (slug: string, name: string) => setTarget({ slug, name });

  const modal = target ? (
    <DestinationExperienceModal
      slug={target.slug}
      destinationName={target.name}
      onClose={() => setTarget(null)}
    />
  ) : null;

  return { open, modal };
}
