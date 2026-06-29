"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Heart,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Hourglass,
  Compass,
  AlertTriangle,
  Utensils,
  Mountain,
  Landmark,
  Music,
  Waves,
  Sparkles,
  Trees,
  Clock,
} from "lucide-react";
import { api, ApiRequestError } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import type {
  Booking,
  DashboardResponse,
  Experience,
  BookingStatus,
  ExperienceCategory,
  PublicUser,
} from "@/lib/types/reisen";
import ExperienceCard from "@/components/experiences/experienceCard";


const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; textClass: string; bgClass: string; icon: typeof Hourglass }
> = {
  pending: { label: "Pending", textClass: "text-warning", bgClass: "bg-warning/10", icon: Hourglass },
  confirmed: { label: "Confirmed", textClass: "text-success", bgClass: "bg-success/10", icon: CheckCircle2 },
  completed: { label: "Completed", textClass: "text-info", bgClass: "bg-info/10", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", textClass: "text-error", bgClass: "bg-error/10", icon: XCircle },
};

const CATEGORY_FILTERS: { value: ExperienceCategory | "all"; label: string; icon: typeof Compass }[] = [
  { value: "all", label: "All", icon: Compass },
  { value: "adventure", label: "Adventure", icon: Mountain },
  { value: "cultural", label: "Culture", icon: Landmark },
  { value: "nightlife", label: "Nightlife", icon: Music },
  { value: "relaxation", label: "Relaxation", icon: Sparkles },
  { value: "wildlife", label: "Wildlife", icon: Trees },
  { value: "water_sports", label: "Water Sports", icon: Waves },
  { value: "romantic", label: "Romantic", icon: Heart },
  { value: "family_friendly", label: "Family", icon: Utensils },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good evening";
}

function AnimationStyles() {
  return (
    <style>{`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes heartPulse {
        0% { transform: scale(1); }
        40% { transform: scale(1.35); }
        100% { transform: scale(1); }
      }
      @keyframes floatSlow {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(6deg); }
      }
      @keyframes blobDrift {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(20px, -16px) scale(1.08); }
      }
      .fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
      .heart-pulse { animation: heartPulse 0.35s ease-out; }
      .float-slow { animation: floatSlow 5s ease-in-out infinite; }
      .blob-drift { animation: blobDrift 12s ease-in-out infinite; }
    `}</style>
  );
}

function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      <div className="blob-drift absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/25 blur-3xl" />
      <div className="blob-drift absolute top-40 right-30 w-80 h-80 rounded-full bg-secondary/15 blur-3xl" style={{ animationDelay: "2.5s" }} />
      <Compass size={28} className="float-slow absolute top-24 right-[12%] text-primary/40" />
      <Sparkles size={20} className="float-slow absolute top-[55%] left-[6%] text-secondary/30" style={{ animationDelay: "1.2s" }} />
    </div>
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

function CategoryPill({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof Compass;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-small-medium whitespace-nowrap transition-all duration-200 ${
        active ? "cta-gradient text-dark-base scale-105 shadow-[0px_4px_10px_0px_rgba(127,92,204,0.25)]" : "bg-primary-50 text-body-dark hover:text-dark-base hover:scale-[1.03]"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

// ---------- Browse cards ----------

function ExperienceBrowseCard({
  experience,
  saved,
  onToggleSave,
  onOpenDetail,
  delayMs,
}: {
  experience: Experience;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onOpenDetail: (experience: Experience) => void;
  delayMs: number;
}) {
  const [pulsing, setPulsing] = useState(false);
  const image = experience.images?.[0];

  function handleHeartClick(e: React.MouseEvent) {
    e.stopPropagation();
    setPulsing(true);
    onToggleSave(experience.experienceId);
    setTimeout(() => setPulsing(false), 350);
  }

  return (
    <div
      onClick={() => onOpenDetail(experience)}
      className="fade-in-up flex flex-col rounded-3xl border border-body-off bg-white-base overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0px_12px_28px_0px_rgba(127,92,204,0.18)] cursor-pointer"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={experience.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full cta-gradient flex items-center justify-center">
            <Compass size={32} className="text-white-base/70" />
          </div>
        )}
        {experience.duration && (
          <span className="absolute bottom-3 left-3 rounded-full bg-dark-base/70 px-2.5 py-1 text-extra-small text-white-base flex items-center gap-1">
            <Clock size={11} /> {experience.duration}
          </span>
        )}
        <button
          onClick={handleHeartClick}
          aria-label={saved ? "Remove from saved" : "Save experience"}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white-base/90 flex items-center justify-center shadow-sm transition-transform hover:scale-110"
        >
          <Heart size={16} className={`${saved ? "fill-secondary text-secondary" : "text-body-dark"} ${pulsing ? "heart-pulse" : ""}`} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-1 flex-1">
        <div className="text-body-medium text-dark-base line-clamp-1">{experience.title}</div>
        <div className="flex items-center gap-1 text-extra-small text-body-dark">
          <MapPin size={12} /> {experience.destination}
        </div>
        <div className="text-small text-body-dark mt-1">
          from <span className="text-body-medium text-dark-base">{formatPrice(experience.price, experience.currency)}</span> /person
        </div>
      </div>
    </div>
  );
}

function BrowseTab({
  savedIds,
  onToggleSave,
  onOpenDetail,
}: {
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  onOpenDetail: (experience: Experience) => void;
}) {
  const [category, setCategory] = useState<ExperienceCategory | "all">("all");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      setLoading(true);
      setError("");
      api.experiences
        .list(category === "all" ? { limit: 24 } : { category, limit: 24 })
        .then((res) => {
          if (!cancelled) setExperiences(res.items);
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof ApiRequestError ? err.message : "Could not load experiences.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORY_FILTERS.map((c) => (
          <CategoryPill
            key={c.value}
            label={c.label}
            icon={c.icon}
            active={category === c.value}
            onClick={() => setCategory(c.value)}
          />
        ))}
      </div>

      {!loading && !error && experiences.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {experiences.map((e) => (
            <ExperienceCard
              key={e.experienceId}
              experience={e}
              onSavedChange={() => {}}
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-3xl border border-dashed border-body-off p-10 text-center text-error text-body-regular">
          {error}
        </div>
      )}

      {!loading && !error && experiences.length === 0 && (
        <div className="rounded-3xl border border-dashed border-body-off p-10 text-center text-body-dark text-body-regular">
          No experiences in this category yet.
        </div>
      )}

      {!loading && !error && experiences.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {experiences.map((e, i) => (
            <ExperienceBrowseCard
              key={e.experienceId}
              experience={e}
              saved={savedIds.has(e.experienceId)}
              onToggleSave={onToggleSave}
              onOpenDetail={onOpenDetail}
              delayMs={i * 60}
            />
          ))}
        </div>
      )}
    </div>
  );
}


function BookingRow({ booking, delayMs }: { booking: Booking; delayMs: number }) {
  return (
    <div
      className="fade-in-up flex items-center justify-between gap-4 flex-wrap rounded-2xl border border-body-off bg-white-base p-5 transition-all duration-300 hover:border-primary hover:-translate-y-0.5 hover:shadow-[0px_8px_18px_0px_rgba(127,92,204,0.14)]"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="min-w-0">
        <div className="text-body-medium text-dark-base mb-1.5">{booking.experienceTitle}</div>
        <div className="flex items-center gap-4 flex-wrap text-extra-small text-body-dark">
          {booking.destination && (
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {booking.destination}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={13} /> {formatDate(booking.requestedDate)}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} /> {booking.groupSize}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-body-medium text-secondary">{formatPrice(booking.totalPrice, booking.currency)}</span>
        <StatusBadge status={booking.status} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-240 mx-auto animate-pulse">
      <div className="h-10 w-64 rounded-full bg-body-light" />
      <div className="flex gap-4">
        <div className="flex-1 h-24 rounded-3xl bg-body-light" />
        <div className="flex-1 h-24 rounded-3xl bg-body-light" />
      </div>
      <div className="h-44 rounded-3xl bg-body-light" />
      <div className="h-56 rounded-3xl bg-body-light" />
    </div>
  );
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="fade-in-up max-w-md mx-auto mt-20 text-center">
      <AlertTriangle size={28} className="text-error mx-auto mb-3" />
      <p className="text-body-regular text-body-dark mb-4">{message}</p>
      <button onClick={onRetry} className="primary-cta">
        <span className="primary-cta-inner !py-2.5 !px-6 text-dark-base">Try again</span>
      </button>
    </div>
  );
}

export default function CustomerDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [tab, setTab] = useState<"browse" | "bookings" | "saved">("browse");
  const router = useRouter();

  const openExperience = (exp: Experience) =>
    router.push(`/experiences/${exp.experienceId}`);

  async function load() {
    setStatus("loading");
    try {
      const [dashboardRes, userRes] = await Promise.all([api.getDashboard(), api.me()]);
      setData(dashboardRes);
      setUser(userRes);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(err instanceof ApiRequestError ? err.message : "Something went wrong loading your dashboard.");
      setStatus("error");
    }
  }

  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);

  const savedIds = new Set(data?.savedExperiences.map((e) => e.experienceId) ?? []);

  async function handleUnsave(experienceId: string) {
    if (!data) return;
    const previous = data;
    setData({
      ...data,
      savedExperiences: data.savedExperiences.filter((e) => e.experienceId !== experienceId),
      stats: { ...data.stats, totalSaved: data.stats.totalSaved - 1 },
    });
    try {
      await api.saved.unsave(experienceId);
    } catch {
      setData(previous);
    }
  }

  async function handleToggleSave(experienceId: string) {
    if (!data) return;
    if (savedIds.has(experienceId)) {
      await handleUnsave(experienceId);
      return;
    }
    try {
      await api.saved.save(experienceId);
      load();
    } catch {
      // no-op — leave UI as-is if the save fails
    }
  }

  return (
    <div className="relative section-wrapper items-stretch! gap-10! bg-white-base min-h-screen overflow-hidden">
      <AnimationStyles />
      <BackgroundDecor />

      {status === "loading" && <DashboardSkeleton />}
      {status === "error" && <DashboardError message={errorMessage} onRetry={load} />}

      {status === "ready" && data && (
        <div className="relative w-full max-w-240 mx-auto flex flex-col gap-8">
          {/* Welcome header */}
          <div className="fade-in-up flex items-center justify-between gap-8 flex-wrap">
            <div className="flex-1 min-w-65">
              <h1 className="text-section-title text-dark-base">Your dashboard</h1>
              <div className="flex items-center gap-1.5 text-secondary text-small-medium my-2">
                <Sparkles size={14} className="float-slow" />
                <span>{getGreeting()}{user?.firstName ? `, ${user.firstName}` : ""} — ready for your next trip?</span>
              </div>
            </div>

            {/* Photo collage */}
            <div className="relative w-full max-w-70 h-32 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://6a3ef2cd424f14ba7961456f.imgix.net/diani2.webp"
                alt="Beach destination"
                className="absolute left-0 top-2 w-28 h-24 rounded-2xl object-cover shadow-[0px_8px_20px_0px_rgba(127,92,204,0.25)] rotate-6 border-4 border-white-base"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=400&q=80"
                alt="Cultural landmark"
                className="absolute left-20 top-0 w-28 h-24 rounded-2xl object-cover shadow-[0px_8px_20px_0px_rgba(127,92,204,0.25)] rotate-3 border-4 border-white-base"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&q=80"
                alt="Adventure trail"
                className="absolute left-40 top-3 w-28 h-24 rounded-2xl object-cover shadow-[0px_8px_20px_0px_rgba(127,92,204,0.25)] rotate-[-2deg] border-4 border-white-base hidden md:block"
              />
              <div className="float-slow absolute -bottom-3 left-6 rounded-full bg-white-base px-3 py-1.5 shadow-[0px_6px_16px_0px_rgba(127,92,204,0.25)] flex items-center gap-1.5 text-extra-small text-dark-base">
                <Sparkles size={12} className="text-secondary" />
                Your next adventure awaits
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="fade-in-up flex items-center justify-between flex-wrap gap-4" style={{ animationDelay: "80ms" }}>
            <div className="flex items-center gap-1 rounded-full bg-primary-50 p-1.5">
              {[
                { key: "browse" as const, label: "Browse" },
                { key: "saved" as const, label: `Saved (${data.stats.totalSaved})` },
                { key: "bookings" as const, label: `Bookings (${data.stats.totalBookings})` },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative rounded-full px-5 py-2 text-small-medium transition-all duration-200 ${
                    tab === t.key ? "bg-white-base text-dark-base shadow-sm" : "text-body-dark hover:text-dark-base"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tab === "browse" && (
            <BrowseTab savedIds={savedIds} onToggleSave={handleToggleSave} onOpenDetail={openExperience} />
          )}

          {tab === "bookings" && (
            <section className="flex flex-col gap-3">
              {data.recentBookings.length === 0 ? (
                <div className="fade-in-up rounded-3xl border border-dashed border-body-off p-10 text-center text-body-dark text-body-regular">
                  No bookings yet — browse experiences to plan your first trip.
                </div>
              ) : (
                data.recentBookings.map((b, i) => <BookingRow key={b.bookingId} booking={b} delayMs={i * 60} />)
              )}
            </section>
          )}

          {tab === "saved" && (
            <section>
              {data.savedExperiences.length === 0 ? (
                <div className="fade-in-up rounded-3xl border border-dashed border-body-off p-10 text-center text-body-dark text-body-regular">
                  Nothing saved yet — tap the heart on any experience to keep it here.
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.savedExperiences.map((e, i) => (
                    <ExperienceCard
                      key={e.experienceId}
                      experience={e}
                      onSavedChange={(saved) => {
                        if (!saved) handleUnsave(e.experienceId);
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

    </div>
  );
}
