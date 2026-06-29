"use client";

import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { MapPin, Info, Sparkles, AlertTriangle } from "lucide-react";
import {
  destinationsApi,
  experiencesApi,
  ApiRequestError,
} from "@/lib/api-client";
import { useDestinationModal } from "@/components/home/destinationExperienceModal";
import ExperienceCard from "@/components/experiences/experienceCard";
import DestinationCard from "@/components/destinations/destinationCard";
import DestinationFilters, {
  type DestinationFilterState,
} from "@/components/destinations/destinationFilters";
import { readRecommendations } from "@/lib/recommendations";
import type { Destination, Experience } from "@/lib/types/reisen";

const RESULTS_LIMIT = 24;
const FEATURED_LIMIT = 8;
const DESTINATIONS_LIMIT = 50;
const FILTER_DEBOUNCE_MS = 300;

const EMPTY_FILTERS: DestinationFilterState = {
  search: "",
  minPrice: "",
  maxPrice: "",
  categories: [],
};

type DestinationResultsProps = {
  slug: string;
};

function ResultsSkeleton() {
  return (
    <div className="card-result-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="w-full h-105 animate-pulse rounded-3xl loading-skeleton-animation"
        />
      ))}
    </div>
  );
}

export default function DestinationResults({ slug }: DestinationResultsProps) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const [listStatus, setListStatus] = useState<"loading" | "error" | "ready">(
    "loading",
  );
  const [listError, setListError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);

  const [filters, setFilters] = useState<DestinationFilterState>(EMPTY_FILTERS);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);

  const [recommended, setRecommended] = useState<Experience[]>([]);
  const [recoPrompt, setRecoPrompt] = useState("");
  const [featuredExperiences, setFeaturedExperiences] = useState<Experience[]>(
    [],
  );
  const [featuredDestinations, setFeaturedDestinations] = useState<
    Destination[]
  >([]);

  const { open, modal } = useDestinationModal();

  const { search, minPrice, maxPrice, categories } = filters;

  // Pag
  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      setStatus("loading");
      setErrorMessage("");
      setFilters(EMPTY_FILTERS);

      // AI matches handed off from the prompt page (keyed by slug).
      const stored = readRecommendations(slug);
      if (stored) {
        setRecommended(stored.recommended);
        setRecoPrompt(stored.prompt);
      } else {
        setRecommended([]);
        setRecoPrompt("");
      }

      destinationsApi
        .getBySlug(slug)
        .then((dest) => {
          if (cancelled) return;
          setDestination(dest);
          setStatus("ready");
        })
        .catch((err) => {
          if (cancelled) return;
          setErrorMessage(
            err instanceof ApiRequestError
              ? err.message
              : "Could not load experiences for this destination.",
          );
          setStatus("error");
        });

      destinationsApi
        .list({ limit: DESTINATIONS_LIMIT })
        .then((res) => {
          if (!cancelled) setAllDestinations(res.items);
        })
        .catch(() => {});

      experiencesApi
        .featured(FEATURED_LIMIT)
        .then((items) => {
          if (!cancelled) setFeaturedExperiences(items);
        })
        .catch(() => {});

      destinationsApi
        .featured()
        .then((items) => {
          if (!cancelled) setFeaturedDestinations(items);
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const debouncedFetchList = useMemo(
    () =>
      debounce(
        (
          params: {
            destination: string;
            search?: string;
            minPrice?: number;
            maxPrice?: number;
          },
          isStale: () => boolean,
        ) => {
          setListStatus("loading");
          setListError("");
          experiencesApi
            .list({ ...params, limit: RESULTS_LIMIT })
            .then((res) => {
              if (isStale()) return;
              setExperiences(res.items);
              setNextCursor(res.nextCursor);
              setListStatus("ready");
            })
            .catch((err) => {
              if (isStale()) return;
              setListError(
                err instanceof ApiRequestError
                  ? err.message
                  : "Could not load experiences for this destination.",
              );
              setListStatus("error");
            });
        },
        FILTER_DEBOUNCE_MS,
      ),
    [],
  );

  useEffect(() => () => debouncedFetchList.cancel(), [debouncedFetchList]);

  useEffect(() => {
    if (!destination) return;
    let cancelled = false;
    debouncedFetchList(
      {
        destination: destination.name,
        search: search.trim() || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      },
      () => cancelled,
    );
    return () => {
      cancelled = true;
    };
  }, [destination, search, minPrice, maxPrice, debouncedFetchList]);

  const visibleExperiences = useMemo(
    () =>
      categories.length === 0
        ? experiences
        : experiences.filter((exp) => categories.includes(exp.category)),
    [experiences, categories],
  );

  const filtersActive =
    search.trim() !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    categories.length > 0;

  function updateFilters(next: Partial<DestinationFilterState>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  function loadMore() {
    if (!destination || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    setListError("");
    experiencesApi
      .list({
        destination: destination.name,
        search: search.trim() || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        limit: RESULTS_LIMIT,
        cursor: nextCursor,
      })
      .then((res) => {
        setExperiences((prev) => [...prev, ...res.items]);
        setNextCursor(res.nextCursor);
      })
      .catch((err) => {
        setListError(
          err instanceof ApiRequestError
            ? err.message
            : "Could not load more experiences.",
        );
      })
      .finally(() => setLoadingMore(false));
  }

  return (
    <section className="section-wrapper items-start gap-5 pt-20 lg:gap-10 bg-white-base min-h-screen bg-[linear-gradient(to_top,#cfbeea,#f9fafb_80%)]">
      {/* HERO */}
      <div className="relative flex min-h-80 w-full flex-col justify-end gap-4 overflow-hidden rounded-[28px] bg-dark-base p-5 lg:p-10">
        {destination?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 animate-pulse bg-primary-50" />
        )}

        <div className="absolute inset-0 bg-black/60" />

        <h1 className="relative z-10 flex items-center gap-2 text-section-title text-white-base">
          <MapPin size={28} className="shrink-0" />
          {destination
            ? `${destination.name}, ${destination.country}`
            : "Destination"}
        </h1>

        {destination?.description && (
          <p className="relative z-10 max-w-200 text-body-regular text-body-light">
            {destination.description}
          </p>
        )}
      </div>

      {status === "loading" && <ResultsSkeleton />}

      {status === "error" && (
        <div className="flex w-full max-w-150 flex-col items-center gap-3 rounded-[28px] border border-dashed border-body-off p-10 text-center">
          <AlertTriangle size={28} className="text-error" />
          <p className="text-body-regular text-body-dark">{errorMessage}</p>
        </div>
      )}

      {status === "ready" && (
        <div className="flex w-full flex-col gap-12">
          {/*AI RECS*/}
          {recommended.length > 0 && (
            <div className="border border-primary p-3 rounded-2xl bg-primary-50">
              <div className="flex w-full flex-col gap-5 rounded-[10px] bg-[url(/gradient_bg.svg)] bg-cover bg-center border border-primary p-6 lg:p-8">
                <div className="flex flex-col gap-1">
                  <h2 className="flex items-center gap-2 text-section-title text-white">
                    AI recommendations
                    <Sparkles
                      size={40}
                      className="text-white animate-spin"
                      style={{ animationDuration: "20s" }}
                      strokeWidth="1"
                    />
                  </h2>
                  <p className="text-body-regular text-body-light">
                    {recoPrompt
                      ? `Matched to: “${recoPrompt}”`
                      : "AI-curated picks based on what you told us about your trip."}
                  </p>
                </div>
                <div className="card-result-grid">
                  {recommended.map((experience) => (
                    <ExperienceCard
                      key={experience.experienceId}
                      experience={experience}
                      highlighted
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex w-full flex-col gap-5">
            <h2 className="text-section-title text-dark-base">
              {recommended.length > 0 ? "All experiences" : "Experiences"} for{" "}
              {destination?.name}
            </h2>

            <DestinationFilters
              filters={filters}
              onChange={updateFilters}
              destinations={allDestinations}
              currentSlug={slug}
              currentName={destination?.name ?? ""}
            />

            {listStatus === "loading" && <ResultsSkeleton />}

            {listStatus === "error" && (
              <div className="flex w-full max-w-150 flex-col items-center gap-3 rounded-[28px] border border-dashed border-body-off p-10 text-center">
                <AlertTriangle size={28} className="text-error" />
                <p className="text-body-regular text-body-dark">{listError}</p>
              </div>
            )}

            {listStatus === "ready" &&
              (visibleExperiences.length === 0 ? (
                <div className="flex w-full max-w-150 self-center mt-10 flex-col items-center gap-3 rounded-[28px] border border-dashed border-info p-10 text-center">
                  <Info size={28} className="text-info" />
                  <p className="text-body-regular text-info">
                    {filtersActive
                      ? "No experiences match your filters, try widening your search."
                      : "No experiences listed here yet, check back soon."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="card-result-grid">
                    {visibleExperiences.map((experience) => (
                      <ExperienceCard
                        key={experience.experienceId}
                        experience={experience}
                      />
                    ))}
                  </div>

                  {nextCursor && (
                    <div className="mt-8 flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="rounded-2xl border border-primary bg-primary-50 px-5 py-2 text-button text-secondary disabled:opacity-60"
                      >
                        {loadingMore ? "Loading…" : "See more"}
                      </button>
                      {listError && (
                        <p className="text-small text-error">{listError}</p>
                      )}
                    </div>
                  )}
                </>
              ))}
          </div>

          {featuredExperiences.length > 0 && (
            <div className="flex w-full flex-col gap-5">
              <h2 className="text-section-title text-dark-base">
                Featured experiences
              </h2>
              <div className="card-result-grid">
                {featuredExperiences.map((experience) => (
                  <ExperienceCard
                    key={experience.experienceId}
                    experience={experience}
                  />
                ))}
              </div>
            </div>
          )}

          {featuredDestinations.length > 0 && (
            <div className="flex w-full flex-col gap-5 ">
              <h2 className="text-section-title text-dark-base">
                Featured destinations
              </h2>
              <div className="card-result-grid">
                {featuredDestinations
                  .filter((destination) => destination.slug !== slug)
                  .map((dest) => (
                    <DestinationCard
                      key={dest.slug}
                      destination={dest}
                      onOpen={open}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {modal}
    </section>
  );
}
