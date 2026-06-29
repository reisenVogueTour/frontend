"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Calendar,
  ImageIcon,
  AlertTriangle,
  MapPinned,
  X,
  CheckCircle2,
} from "lucide-react";
import {
  experiencesApi,
  providersApi,
  bookingsApi,
  ApiRequestError,
} from "@/lib/api-client";
import { formatPrice, formatEventDate } from "@/lib/format";
import ExperienceCard from "@/components/experiences/experienceCard";
import SaveButton from "@/components/experiences/saveButton";
import type {
  Experience,
  PublicProvider,
  CreateBookingRequest,
} from "@/lib/types/reisen";

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

function BookingModal({
  experience,
  onClose,
  onSuccess,
}: {
  experience: Experience;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    requestedDate: "",
    groupSize: 1,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const bookingData: CreateBookingRequest = {
      experienceId: experience.experienceId,
      requestedDate: new Date(form.requestedDate).toISOString(),
      groupSize: form.groupSize,
      notes: form.notes.trim() || undefined,
    };

    try {
      await bookingsApi.create(bookingData);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to create booking. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-dark-base/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white-base rounded-3xl p-8 w-full max-w-md text-center">
          <CheckCircle2 size={48} className="text-success mx-auto mb-4" />
          <h3 className="text-section-inner-title text-dark-base mb-2">
            Booking Requested!
          </h3>
          <p className="text-body-regular text-body-dark">
            Your booking request has been sent to the provider. You'll be
            notified once it's confirmed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-dark-base/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white-base rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-section-inner-title text-dark-base">
            Request booking
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center"
          >
            <X size={16} className="text-body-dark" />
          </button>
        </div>

        <div className="mb-4 p-4 rounded-2xl bg-primary-50">
          <p className="text-body-medium text-dark-base">{experience.title}</p>
          <p className="text-small text-body-dark">
            {formatPrice(experience.price, experience.currency)} / person
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-small-medium text-body-dark">
              Requested date
            </span>
            <input
              type="date"
              value={form.requestedDate}
              onChange={(e) =>
                setForm({ ...form, requestedDate: e.target.value })
              }
              required
              min={new Date().toISOString().split("T")[0]}
              className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-small-medium text-body-dark">Group size</span>
            <input
              type="number"
              min={1}
              max={experience.maxGroupSize}
              value={form.groupSize}
              onChange={(e) =>
                setForm({ ...form, groupSize: Number(e.target.value) })
              }
              required
              className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
            />
            <span className="text-extra-small text-body-dark">
              Max: {experience.maxGroupSize} people
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-small-medium text-body-dark">
              Notes (optional)
            </span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Any special requests or questions..."
              className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary resize-none"
            />
          </label>

          {error && <p className="text-small text-error">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <p className="text-body-medium text-dark-base">
              Total:{" "}
              {formatPrice(
                experience.price * form.groupSize,
                experience.currency,
              )}
            </p>
            <button type="submit" disabled={submitting} className="primary-cta">
              <span className="primary-cta-inner !py-2.5 !px-6 text-dark-base">
                {submitting ? "Submitting..." : "Confirm request"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
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
  const [showBookingModal, setShowBookingModal] = useState(false);

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
                      <ImageIcon size={40} className="text-dark-base/70" />
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

                <button
                  type="button"
                  onClick={() => setShowBookingModal(true)}
                  className="primary-cta cursor-pointer relative z-20"
                >
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

      {showBookingModal && experience && (
        <BookingModal
          experience={experience}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            // Optionally refresh data or show success message
          }}
        />
      )}
    </>
  );
}
