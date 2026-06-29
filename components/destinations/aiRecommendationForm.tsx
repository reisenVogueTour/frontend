"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  AlertTriangle,
  Loader2,
  Power,
  Send,
  PartyPopper,
  Info,
} from "lucide-react";
import {
  destinationsApi,
  experiencesApi,
  ApiRequestError,
} from "@/lib/api-client";
import { getStoredToken } from "@/lib/auth-client";
import { storeRecommendations } from "@/lib/recommendations";
import type { Destination } from "@/lib/types/reisen";

const MIN_PROMPT = 3;
const MAX_PROMPT = 1000;
const PLACEHOLDER =
  "e.g. I love art galleries, slow coffee mornings and a romantic evening,  nothing too extreme.";

type Status = "idle" | "generating" | "no-matches" | "error" | "success";
type SubmitError = { message: string; retryable: boolean };

export default function AiRecommendationForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<SubmitError | null>(null);

  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!getStoredToken()) {
      router.replace(
        `/auth?next=${encodeURIComponent(
          `/ai-recommendations?destination=${slug}`,
        )}`,
      );
      return;
    }

    let cancelled = false;

    destinationsApi.getBySlug(slug).then((dest) => {
      if (!cancelled) setDestination(dest);
    });

    return () => {
      cancelled = true;
    };
  }, [slug, router]);

  // Abort any in-flight request if the page unmounts.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const trimmed = prompt.trim();
  const canSubmit = trimmed.length >= MIN_PROMPT && status !== "generating";

  function leaveToResults() {
    controllerRef.current?.abort();
    router.push(`/destinations/${slug}`);
  }

  async function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    if (!canSubmit) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus("generating");
    setError(null);

    try {
      const { recommended } = await experiencesApi.recommendations(
        { slug: slug, prompt: trimmed },
        controller.signal,
      );

      if (recommended.length === 0) {
        setStatus("no-matches");
        return;
      }

      storeRecommendations({ slug, prompt: trimmed, recommended });
      setStatus("success");
      router.push(`/destinations/${slug}`);
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err instanceof ApiRequestError) {
        setError({ message: err.message, retryable: err.retryable !== false });
      } else {
        setError({
          message: "Something went wrong. Please try again.",
          retryable: true,
        });
      }
      setStatus("error");
    }
  }

  const destinationLabel = destination
    ? `Experiences in ${destination.name}`
    : "Experiences in this destination";

  return (
    <div className="flex min-h-screen flex-col justify-between items-center gap-6 bg-white-base p-5 lg:gap-8 lg:p-10">
      {/* DESTINATION IMAGE WITH HEADING & QUIT BUTTON */}
      <div className="relative h-106.5 w-full overflow-hidden rounded-[28px] bg-dark-base">
        {destination?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={destination?.imageUrl}
            alt={destination ? destination.name : ""}
            className="h-full w-full object-cover bg-center"
          />
        ) : (
          <div className="h-full w-full object-cover bg-primary-50 animate-pulse" />
        )}

        <div className="absolute inset-0 bg-black/40" />

        <button
          type="button"
          onClick={leaveToResults}
          aria-label="Quit"
          className="absolute right-4 top-4 z-10 text-white-base transition-colors hover:text-secondary cursor-pointer"
        >
          <Power size={32} />
        </button>

        <h1 className="absolute bottom-6 left-6 z-10 max-w-[80%] text-section-title text-white-base lg:bottom-8 lg:left-8">
          {destinationLabel}
        </h1>
      </div>

      {/* STATUS SECTION */}
      <div aria-live="polite" className="min-h-12">
        {status === "generating" && (
          <div className="flex flex-col items-center gap-5 max-w-100 rounded-2xl bg-primary-50 p-4 border border-primary">
            <p className="text-body-regular text-body-dark">
              Matching experiences to your description…
            </p>
            <Sparkles size={40} className="text-secondary animate-ping" />
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-5 max-w-100 rounded-2xl bg-success/20 p-4 border border-success">
            <p className="text-body-regular text-success">
              Found your picks, taking you there…
            </p>
            <PartyPopper size={40} className="text-success" />
          </div>
        )}

        {status === "no-matches" && (
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-info/20 p-4 border border-info max-w-100 text-center">
            <p className="text-body-regular text-body-dark">
              Couldn&apos;t find experiences that match that description. Try
              mentioning different interests, a vibe, or the pace you want.
            </p>
            <Info size={40} className="mt-0.5 shrink-0 text-info" />
          </div>
        )}

        {status === "error" && error && (
          <div className="flex items-start gap-3 rounded-2xl border border-error/30 bg-error/5 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-error" />
            <p className="text-body-regular text-body-dark">
              {error.message}
              {error.retryable && " You can try again."}
            </p>
          </div>
        )}
      </div>

      {/* PROMPT INPUT */}
      <form onSubmit={handleSubmit} className="w-full max-w-187.5 h-fit">
        <div className="card-shadow-primary-glow box-border flex items-end gap-2 min-h-15 p-2 pl-4 rounded-3xl border border-primary/50 bg-white-base transition-colors focus-within:border-primary overflow-hidden">
          <textarea
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value.slice(0, MAX_PROMPT));
              if (status === "no-matches" || status === "error")
                setStatus("idle");
              if (error) setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            placeholder={PLACEHOLDER}
            rows={1}
            maxLength={MAX_PROMPT}
            autoFocus
            className="block self-center w-full pl-4 resize-none field-sizing-content max-h-[4lh] overflow-y-auto bg-transparent text-body-regular text-dark-base outline-none placeholder:text-body-dark/60"
          />

          <div className="flex items-center gap-2">
            <span className="text-extra-small text-body-dark">
              {trimmed.length}/{MAX_PROMPT}
            </span>
            <button
              type="submit"
              disabled={!canSubmit}
              aria-label={
                status === "error" ? "Try again" : "Get my recommendations"
              }
              className="primary-cta pointer-events-auto h-11 w-fit flex-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="primary-cta-inner flex h-full w-full items-center justify-center  text-dark-base">
                {status === "generating" ? (
                  <Loader2 size={28} className="animate-spin" />
                ) : (
                  <Send size={28} />
                )}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
