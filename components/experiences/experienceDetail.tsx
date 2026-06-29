"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Calendar,
  Compass,
  AlertTriangle,
  MapPinned,
} from "lucide-react";
import {
  experiencesApi,
  providersApi,
  ApiRequestError,
} from "@/lib/api-client";
import { formatPrice, formatEventDate } from "@/lib/format";
import ExperienceCard from "@/components/experiences/experienceCard";
import SaveButton from "@/components/experiences/saveButton";
import type { Experience, PublicProvider } from "@/lib/types/reisen";

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
const RELATED_LIMIT = 4;

function ProviderMap({ location }: { location: string }) {
  if (!location) return null;

  if (!MAPS_KEY) {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-body-off bg-primary-50/50 text-center">
        <MapPinned size={24} className="text-secondary" />
        <p className="text-small text-body-dark">{location}</p>
      </div>
    );
  }

  return (
    <iframe
      title={`Map of ${location}`}
      className="h-100 w-full rounded-2xl border border-body-off"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${encodeURIComponent(
        location,
      )}`}
    />
  );
}

export default function ExperienceDetail({
  experienceId,
}: {
  experienceId: string;
}) {
  const router = useRouter();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [provider, setProvider] = useState<PublicProvider | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [related, setRelated] = useState<Experience[]>([]);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      setStatus("loading");
      setErrorMessage("");
      setActiveImage(0);
      setRelated([]);

      experiencesApi
        .getById(experienceId)
        .then((exp) => {
          if (cancelled) return;
          setExperience(exp);

          providersApi.getPublicProfile(exp.providerId).then((p) => {
            if (!cancelled) setProvider(p);
          });

          experiencesApi
            .list({ destination: exp.destination, limit: RELATED_LIMIT + 4 })
            .then((res) => {
              if (cancelled) return;
              setRelated(
                res.items
                  .filter((e) => e.experienceId !== exp.experienceId)
                  .slice(0, RELATED_LIMIT),
              );
            })
            .then(() => setStatus("ready"));
        })
        .catch((err) => {
          if (cancelled) return;
          setErrorMessage(
            err instanceof ApiRequestError
              ? err.message
              : "Could not load this experience.",
          );
          setStatus("error");
        });
    });

    return () => {
      cancelled = true;
    };
  }, [experienceId]);

  return (
    <>
      <section className="flex justify-center pt-2.5 lg:pt-5 ">
        <div className="section-wrapper items-start! bg-white-base pb-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-small-medium text-body-dark transition-colors hover:text-dark-base cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {status === "loading" && (
            <div className="grid w-full gap-8 lg:grid-cols-2 my-10">
              <div className="flex flex-col gap-10">
                <div className="aspect-4/3 w-full animate-pulse rounded-3xl bg-body-dark/30" />
                <div className="bg-body-dark/30 h-15 rounded-[67px]"></div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="h-15 w-full animate-pulse rounded-2xl bg-body-dark/30" />
                <div className="h-48 w-full animate-pulse rounded-2xl bg-body-dark/30" />
                <div className="h-90 w-full animate-pulse rounded-2xl bg-body-dark/30" />
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex  self-center w-full mt-10 max-w-150 flex-col items-center gap-3 rounded-[28px] border border-dashed border-error p-10 text-center">
              <AlertTriangle size={28} className="text-error" />
              <p className="text-body-regular text-error">{errorMessage}</p>
            </div>
          )}

          {status === "ready" && experience && (
            <div className="grid w-full gap-5  md:gap-10 md:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-4 w-full md:sticky md:top-5 md:self-start">
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl bg-primary-50">
                  <SaveButton
                    experienceId={experienceId}
                    className="absolute right-5 top-5 z-10 active:translate-y-1"
                  />
                  {experience.images?.[activeImage] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={experience.images[activeImage]}
                      alt={experience.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary-50">
                      <Compass size={40} className="text-dark-base" />
                    </div>
                  )}
                </div>

                {experience.images && experience.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {experience.images.map((src, index) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        aria-label={`View image ${index + 1}`}
                        className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition-colors z-40 ${
                          index === activeImage
                            ? "border-secondary"
                            : "border-transparent"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <button type="button" className="primary-cta cursor-pointer">
                  <span className="primary-cta-inner block w-full text-dark-base">
                    Request booking
                  </span>
                </button>
              </div>

              <div className="flex min-w-0 flex-col gap-5 w-full">
                <h1 className="text-section-title text-dark-base wrap-break-word">
                  {experience.title}
                </h1>

                <div className="flex flex-col gap-3">
                  <p className="flex items-center gap-1.5 text-body-regular text-body-dark">
                    <MapPin size={24} className="text-secondary" />{" "}
                    {experience.destination}
                  </p>
                  {experience.duration && (
                    <p className="flex items-center gap-1.5 text-body-regular text-body-dark">
                      <Clock size={24} className="text-secondary" />{" "}
                      {experience.duration}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 text-body-regular text-body-dark">
                    <Users size={24} className="text-secondary" /> Up to{" "}
                    {experience.maxGroupSize} people
                  </p>

                  {experience.eventDate && (
                    <p className="flex items-center gap-1.5 text-body-regular text-body-dark">
                      <Calendar size={24} className="text-secondary" />{" "}
                      {formatEventDate(experience.eventDate)}
                    </p>
                  )}
                  <p className="text-body-regular text-body-dark">
                    from{" "}
                    <span className="text-success text-body-medium">
                      {formatPrice(experience.price, experience.currency)}
                    </span>{" "}
                    /person
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-extra-small text-body-dark">
                  <div className="rounded-full bg-primary-50/50 px-5 py-2 capitalize text-secondary border border-secondary">
                    {experience.category.replace("_", " ")}
                  </div>
                </div>

                <p className="text-body-regular text-body-dark whitespace-pre-line wrap-break-word">
                  {experience.description}
                </p>

                {/* Provider */}
                {provider && (
                  <div className="flex flex-col gap-3 rounded-[28px] border border-body-off p-5 mt-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-extra-small text-secondary">
                        Offered by
                      </span>
                      <h2 className="text-section-inner-title text-dark-base">
                        {provider.businessName}
                      </h2>
                    </div>
                    {provider.description && (
                      <p className="text-body-regular text-body-dark">
                        {provider.description}
                      </p>
                    )}
                    {provider.location && (
                      <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-1.5 text-small-medium text-body-dark">
                          <MapPin size={14} /> {provider.location}
                        </span>
                        <ProviderMap location={provider.location} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {status === "ready" && experience && related.length > 0 && (
        <section className=" flex justify-center w-full bg-[linear-gradient(to_top,#cfbeea,#f9fafb_80%)]">
          <div className="section-wrapper items starts">
            <h2 className="text-section-title text-dark-base">
              Related experiences
            </h2>
            <div className="grid w-full grid-cols-1 justify-center gap-5 md:grid-cols-[repeat(auto-fill,340px)]">
              {related.map((exp) => (
                <ExperienceCard key={exp.experienceId} experience={exp} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
