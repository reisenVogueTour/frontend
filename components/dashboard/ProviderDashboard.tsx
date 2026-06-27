// components/ProviderDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Hourglass,
  AlertTriangle,
  Plus,
  Pencil,
  Sparkles,
  Clock,
  X,
} from "lucide-react";
import { api, ApiRequestError } from "@/lib/api-client";
import type {
  Booking,
  BookingStatus,
  CreateExperienceRequest,
  Experience,
  ExperienceCategory,
  ProviderDashboardResponse,
} from "@/lib/types/reisen";

const CATEGORY_OPTIONS: ExperienceCategory[] = [
  "adventure",
  "relaxation",
  "nightlife",
  "cultural",
  "wildlife",
  "water_sports",
  "romantic",
  "family-friendly",
];

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; textClass: string; bgClass: string; icon: typeof Hourglass }
> = {
  pending: { label: "Pending", textClass: "text-warning", bgClass: "bg-warning/10", icon: Hourglass },
  confirmed: { label: "Confirmed", textClass: "text-success", bgClass: "bg-success/10", icon: CheckCircle2 },
  completed: { label: "Completed", textClass: "text-info", bgClass: "bg-info/10", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", textClass: "text-error", bgClass: "bg-error/10", icon: XCircle },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function AnimationStyles() {
  return (
    <style>{`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
    `}</style>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-extra-small ${cfg.textClass} ${cfg.bgClass}`}>
      <Icon size={13} strokeWidth={2.2} />
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 min-w-[150px] rounded-3xl bg-white-base border border-body-off p-5">
      <div className="text-small text-body-dark mb-1">{label}</div>
      <div className="text-section-title text-dark-base">{value}</div>
    </div>
  );
}

// ---------- Pending / Rejected gates ----------

function PendingState() {
  return (
    <div className="fade-in-up max-w-md mx-auto mt-16 text-center">
      <Hourglass size={28} className="text-warning mx-auto mb-3" />
      <h2 className="text-section-inner-title text-dark-base mb-2">Application under review</h2>
      <p className="text-body-regular text-body-dark">
        Your provider application is being reviewed by our team. You'll be able to create and manage experiences
        once it&apos;s approved — usually within a few hours.
      </p>
    </div>
  );
}

function RejectedState({ reason }: { reason?: string }) {
  return (
    <div className="fade-in-up max-w-md mx-auto mt-16 text-center">
      <XCircle size={28} className="text-error mx-auto mb-3" />
      <h2 className="text-section-inner-title text-dark-base mb-2">Application not approved</h2>
      {reason && <p className="text-body-regular text-body-dark mb-3">{reason}</p>}
      <p className="text-small text-body-dark">
        Update your business details and resubmit — reach out to support if you have questions.
      </p>
    </div>
  );
}

// ---------- Experience management ----------

function ExperienceRow({ experience, onEdit }: { experience: Experience; onEdit: (e: Experience) => void }) {
  const statusStyles =
    experience.status === "published"
      ? "text-success bg-success/10"
      : experience.status === "draft"
        ? "text-warning bg-warning/10"
        : "text-body-dark bg-body-off";

  return (
    <div className="fade-in-up flex items-center justify-between gap-4 flex-wrap rounded-2xl border border-body-off bg-white-base p-5 hover:border-primary transition-colors">
      <div className="min-w-0">
        <div className="text-body-medium text-dark-base mb-1.5">{experience.title}</div>
        <div className="flex items-center gap-4 flex-wrap text-extra-small text-body-dark">
          <span className="flex items-center gap-1">
            <MapPin size={13} /> {experience.destination}
          </span>
          {experience.duration && (
            <span className="flex items-center gap-1">
              <Clock size={13} /> {experience.duration}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-body-medium text-secondary">{formatPrice(experience.price, experience.currency)}</span>
        <span className={`rounded-full px-3 py-1 text-extra-small capitalize ${statusStyles}`}>{experience.status}</span>
        <button
          onClick={() => onEdit(experience)}
          aria-label="Edit experience"
          className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Pencil size={14} className="text-secondary" />
        </button>
      </div>
    </div>
  );
}

interface ExperienceFormState {
  title: string;
  description: string;
  destination: string;
  category: ExperienceCategory;
  eventDate: string;
  numberOfDays: number;
  price: number;
  maxGroupSize: number;
  status: "draft" | "published";
  imagesText: string;
}

const EMPTY_FORM: ExperienceFormState = {
  title: "",
  description: "",
  destination: "",
  category: "adventure",
  eventDate: "",
  numberOfDays: 1,
  price: 0,
  maxGroupSize: 1,
  status: "draft",
  imagesText: "",
};

function ExperienceFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Experience | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ExperienceFormState>(
    initial
      ? {
          title: initial.title,
          description: initial.description,
          destination: initial.destination,
          category: initial.category,
          eventDate: initial.eventDate.slice(0, 10),
          numberOfDays: initial.numberOfDays,
          price: initial.price,
          maxGroupSize: initial.maxGroupSize,
          status: initial.status === "archived" ? "draft" : initial.status,
          imagesText: (initial.images ?? []).join(", "),
        }
      : EMPTY_FORM,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof ExperienceFormState>(key: K, value: ExperienceFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    const images = form.imagesText
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
    const { imagesText, eventDate, ...rest } = form;
    const isoEventDate = new Date(eventDate).toISOString();
    try {
      if (initial) {
        await api.experiences.update(initial.experienceId, { ...rest, images, eventDate: isoEventDate });
      } else {
        const payload: CreateExperienceRequest = {
          ...rest,
          images,
          eventDate: isoEventDate,
        };
        await api.experiences.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save this experience.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-dark-base/50 flex items-center justify-center z-50 p-4">
      <div className="fade-in-up bg-white-base rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-section-inner-title text-dark-base">
            {initial ? "Edit experience" : "New experience"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
            <X size={16} className="text-body-dark" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-small-medium text-body-dark">Title</span>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
              placeholder="Sunset Lagoon Boat Tour"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-small-medium text-body-dark">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary resize-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-small-medium text-body-dark">Destination</span>
              <input
                value={form.destination}
                onChange={(e) => update("destination", e.target.value)}
                className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
                placeholder="Lagos"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-small-medium text-body-dark">Category</span>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value as ExperienceCategory)}
                className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary capitalize"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-small-medium text-body-dark">Event date</span>
              <input
                type="date"
                value={form.eventDate}
                onChange={(e) => update("eventDate", e.target.value)}
                className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-small-medium text-body-dark">Days</span>
              <input
                type="number"
                min={1}
                value={form.numberOfDays}
                onChange={(e) => update("numberOfDays", Number(e.target.value))}
                className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-small-medium text-body-dark">Max group</span>
              <input
                type="number"
                min={1}
                value={form.maxGroupSize}
                onChange={(e) => update("maxGroupSize", Number(e.target.value))}
                className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-small-medium text-body-dark">Price (NGN)</span>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => update("price", Number(e.target.value))}
                className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-small-medium text-body-dark">Status</span>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value as "draft" | "published")}
                className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-small-medium text-body-dark">Image URLs (comma-separated)</span>
            <textarea
              value={form.imagesText}
              onChange={(e) => update("imagesText", e.target.value)}
              rows={2}
              className="rounded-xl border border-body-off px-3.5 py-2.5 text-body-regular text-dark-base outline-none focus:border-primary resize-none"
              placeholder="https://images.unsplash.com/photo-..., https://images.unsplash.com/photo-..."
            />
            {form.imagesText.trim() && (
              <div className="flex gap-2 mt-1 overflow-x-auto">
                {form.imagesText
                  .split(",")
                  .map((url) => url.trim())
                  .filter(Boolean)
                  .map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`Preview ${i + 1}`}
                      className="w-16 h-16 rounded-lg object-cover border border-body-off flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = "0.3";
                      }}
                    />
                  ))}
              </div>
            )}
          </label>

          {error && <p className="text-small text-error">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="primary-cta mt-2"
          >
            <span className="primary-cta-inner !py-3 text-dark-base block">
              {submitting ? "Saving..." : initial ? "Save changes" : "Create experience"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Bookings ----------

function ProviderBookingRow({ booking, onUpdateStatus }: { booking: Booking; onUpdateStatus: (id: string, status: BookingStatus) => void }) {
  return (
    <div className="fade-in-up flex items-center justify-between gap-4 flex-wrap rounded-2xl border border-body-off bg-white-base p-5">
      <div className="min-w-0">
        <div className="text-body-medium text-dark-base mb-1.5">{booking.experienceTitle}</div>
        <div className="flex items-center gap-4 flex-wrap text-extra-small text-body-dark">
          <span className="flex items-center gap-1">
            <Calendar size={13} /> {formatDate(booking.requestedDate)}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} /> {booking.groupSize}
          </span>
          <span>{formatPrice(booking.totalPrice, booking.currency)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={booking.status} />
        {booking.status === "pending" && (
          <>
            <button
              onClick={() => onUpdateStatus(booking.bookingId, "confirmed")}
              className="rounded-full bg-success/10 text-success px-3.5 py-1.5 text-small-medium hover:bg-success/20 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => onUpdateStatus(booking.bookingId, "cancelled")}
              className="rounded-full bg-error/10 text-error px-3.5 py-1.5 text-small-medium hover:bg-error/20 transition-colors"
            >
              Decline
            </button>
          </>
        )}
        {booking.status === "confirmed" && (
          <button
            onClick={() => onUpdateStatus(booking.bookingId, "completed")}
            className="rounded-full bg-info/10 text-info px-3.5 py-1.5 text-small-medium hover:bg-info/20 transition-colors"
          >
            Mark completed
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Shared states ----------

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-240 mx-auto animate-pulse">
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-1 h-20 rounded-3xl bg-body-light" />
        ))}
      </div>
      <div className="h-44 rounded-3xl bg-body-light" />
      <div className="h-56 rounded-3xl bg-body-light" />
    </div>
  );
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <AlertTriangle size={28} className="text-error mx-auto mb-3" />
      <p className="text-body-regular text-body-dark mb-4">{message}</p>
      <button onClick={onRetry} className="primary-cta">
        <span className="primary-cta-inner !py-2.5 !px-6 text-dark-base">Try again</span>
      </button>
    </div>
  );
}

export default function ProviderDashboard() {
  const [data, setData] = useState<ProviderDashboardResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [tab, setTab] = useState<"experiences" | "bookings">("experiences");
  const [editingExperience, setEditingExperience] = useState<Experience | "new" | null>(null);

  async function load() {
    setStatus("loading");
    try {
      const res = await api.providers.getMyDashboard();
      setData(res);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(err instanceof ApiRequestError ? err.message : "Something went wrong loading your dashboard.");
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpdateBookingStatus(bookingId: string, newStatus: BookingStatus) {
    if (!data) return;
    const previous = data;
    setData({
      ...data,
      recentBookings: data.recentBookings.map((b) => (b.bookingId === bookingId ? { ...b, status: newStatus } : b)),
    });
    try {
      await api.bookings.updateStatus(bookingId, newStatus);
    } catch {
      setData(previous);
    }
  }

  return (
    <div className="section-wrapper !items-stretch !gap-8 bg-body-light min-h-screen">
      <AnimationStyles />
      {status === "loading" && <DashboardSkeleton />}
      {status === "error" && <DashboardError message={errorMessage} onRetry={load} />}

      {status === "ready" && data && data.applicationStatus === "pending" && <PendingState />}
      {status === "ready" && data && data.applicationStatus === "rejected" && (
        <RejectedState reason={data.profile.rejectionReason} />
      )}

      {status === "ready" && data && data.applicationStatus === "approved" && (
        <div className="w-full max-w-240 mx-auto flex flex-col gap-8">
          <div className="fade-in-up flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-secondary text-small-medium mb-1">
                <Sparkles size={14} />
                <span>Provider dashboard</span>
              </div>
              <h1 className="text-section-title text-dark-base">{data.profile.businessName}</h1>
            </div>
            <button onClick={() => setEditingExperience("new")} className="primary-cta">
              <span className="primary-cta-inner !py-2.5 !px-6 flex items-center gap-2 text-dark-base">
                <Plus size={16} /> New experience
              </span>
            </button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <StatCard label="Total experiences" value={data.stats.totalExperiences} />
            <StatCard label="Published" value={data.stats.publishedExperiences} />
            <StatCard label="Drafts" value={data.stats.draftExperiences} />
            <StatCard label="Pending bookings" value={data.stats.pendingBookings} />
          </div>

          <div className="flex items-center gap-1 rounded-full bg-primary-50 p-1.5 w-fit">
            {[
              { key: "experiences" as const, label: `Experiences (${data.experiences.length})` },
              { key: "bookings" as const, label: `Bookings (${data.recentBookings.length})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-5 py-2 text-small-medium transition-colors ${
                  tab === t.key ? "bg-white-base text-dark-base shadow-sm" : "text-body-dark hover:text-dark-base"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "experiences" && (
            <section className="flex flex-col gap-3">
              {data.experiences.length === 0 ? (
                <div className="fade-in-up rounded-3xl border border-dashed border-body-off p-10 text-center text-body-dark text-body-regular">
                  No experiences yet — create your first listing to start getting bookings.
                </div>
              ) : (
                data.experiences.map((e) => (
                  <ExperienceRow key={e.experienceId} experience={e} onEdit={setEditingExperience} />
                ))
              )}
            </section>
          )}

          {tab === "bookings" && (
            <section className="flex flex-col gap-3">
              {data.recentBookings.length === 0 ? (
                <div className="fade-in-up rounded-3xl border border-dashed border-body-off p-10 text-center text-body-dark text-body-regular">
                  No bookings yet.
                </div>
              ) : (
                data.recentBookings.map((b) => (
                  <ProviderBookingRow key={b.bookingId} booking={b} onUpdateStatus={handleUpdateBookingStatus} />
                ))
              )}
            </section>
          )}
        </div>
      )}

      {editingExperience && (
        <ExperienceFormModal
          initial={editingExperience === "new" ? null : editingExperience}
          onClose={() => setEditingExperience(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}