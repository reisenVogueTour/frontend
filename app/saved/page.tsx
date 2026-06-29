"use client";

import { useEffect, useState } from "react";
import { useApp, Experience } from "../shared/AppContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchAPI } from "../shared/api";

const MOCK_EXPERIENCES: Experience[] = [
  {
    experienceId: "exp-lagos-kayak",
    providerId: "prov-1",
    title: "Kayaking in Lagos Lagoons",
    description:
      "Paddle through Lagos's beautiful lagoons, navigating around fishing communities and catching a breathtaking view of the Lekki-Ikoyi Bridge.",
    destination: "Lagos",
    destinationSlug: "lagos",
    category: "adventure",
    eventDate: "2026-08-10T09:00:00.000Z",
    numberOfDays: 1,
    price: 25000,
    currency: "NGN",
    duration: "1 day",
    maxGroupSize: 12,
    images: ["/experience_placeholder.jpg"],
    featured: true,
    status: "published",
  },
  {
    experienceId: "exp-tokyo-vinyl",
    providerId: "prov-2",
    title: "Tokyo Vinyl & Slow Coffee Tour",
    description:
      "Dive deep into the historic record shops of Shimokitazawa and enjoy pour-over coffee at tucked-away kissatens with a local music collector.",
    destination: "Tokyo",
    destinationSlug: "tokyo",
    category: "cultural",
    eventDate: "2026-09-15T10:00:00.000Z",
    numberOfDays: 1,
    price: 95000,
    currency: "NGN",
    duration: "6 hours",
    maxGroupSize: 6,
    images: ["/experience_placeholder.jpg"],
    featured: true,
    status: "published",
  },
  {
    experienceId: "exp-paris-art",
    providerId: "prov-3",
    title: "Montmartre Hidden Art Studios",
    description:
      "Walk inside the private ateliers where modern art was born. Meet working printmakers and paint on canvas overlooking the city.",
    destination: "Paris",
    destinationSlug: "paris",
    category: "romantic",
    eventDate: "2026-07-20T14:00:00.000Z",
    numberOfDays: 1,
    price: 75000,
    currency: "NGN",
    duration: "4 hours",
    maxGroupSize: 8,
    images: ["/experience_placeholder.jpg"],
    featured: false,
    status: "published",
  },
  {
    experienceId: "exp-london-punk",
    providerId: "prov-4",
    title: "East London Street Art & Punk History",
    description:
      "Explore the rebellious roots of Camden and Shoreditch, following punk lore and identifying hidden masterpieces by street legends.",
    destination: "London",
    destinationSlug: "london",
    category: "nightlife",
    eventDate: "2026-08-25T18:00:00.000Z",
    numberOfDays: 1,
    price: 45000,
    currency: "NGN",
    duration: "3 hours",
    maxGroupSize: 15,
    images: ["/experience_placeholder.jpg"],
    featured: false,
    status: "published",
  },
];

export default function SavedPage() {
  const { token, toggleSaveExperience, savedIds, syncSavedWithBackend } =
    useApp();
  const router = useRouter();

  const [savedExperiences, setSavedExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadSaved = async () => {
      setLoading(true);
      setError("");

      try {
        await syncSavedWithBackend();
        const data = await fetchAPI<Experience[]>("/api/saved");

        // Merge with local mock experiences if savedIds has elements not returned by the API
        const apiIds = new Set(data.map((item) => item.experienceId));
        const mergedList = [...data];

        savedIds.forEach((id) => {
          if (!apiIds.has(id)) {
            const mockExp = MOCK_EXPERIENCES.find(
              (exp) => exp.experienceId === id,
            );
            if (mockExp) {
              mergedList.push(mockExp);
            }
          }
        });

        setSavedExperiences(mergedList.filter((item) => item !== null));
      } catch (err) {
        console.error("Failed to load saved experiences from API:", err);
        // Fallback to local mock filtering based on savedIds
        const localSaved = MOCK_EXPERIENCES.filter((exp) =>
          savedIds.includes(exp.experienceId),
        );
        setSavedExperiences(localSaved);
      } finally {
        setLoading(false);
      }
    };

    loadSaved();
  }, [token, savedIds]);

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleSaveExperience(id);
      setSavedExperiences((prev) =>
        prev.filter((item) => item.experienceId !== id),
      );
    } catch (err: any) {
      alert(err.message || "Failed to remove saved experience.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-5 text-center gap-4">
        <h1 className="text-section-title text-dark-base">Saved Experiences</h1>
        <p className="text-body-medium text-body-dark max-w-sm">
          Please login or register to save your favorite local experiences.
        </p>
        <div className="flex gap-4 mt-2">
          <Link
            href="/login"
            className="bg-secondary text-white-base px-6 py-3 rounded-full font-bold text-small"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="border border-primary text-dark-base px-6 py-3 rounded-full font-medium text-small hover:bg-primary-50"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-400 mx-auto px-5 lg:px-10 pb-20 pt-24 lg:pt-32">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-section-title text-dark-base mb-2">
          Saved Experiences
        </h1>
        <p className="text-body-medium text-body-dark">
          Your personal wishlist of matching tours and local activities.
        </p>
      </div>

      {savedExperiences.length === 0 ? (
        <div className="text-center py-20 bg-white-base border border-body-off rounded-[28px] p-10 flex flex-col items-center justify-center gap-4">
          <span className="text-section-inner-title text-body-dark">
            Your wishlist is empty
          </span>
          <p className="text-body-medium text-body-dark max-w-sm">
            Browse through our destinations and click the heart icon on any
            experience to save it here.
          </p>
          <Link href="/experiences" className="primary-cta cursor-pointer mt-2">
            <span className="primary-cta-inner">Explore Experiences</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedExperiences.map((exp, index) => {
            const tiltClass =
              index % 2 === 0 ? "hover:rotate-1" : "hover:-rotate-1";

            return (
              <Link
                key={exp.experienceId}
                href={`/experiences/${exp.experienceId}`}
                className={`group relative flex flex-col justify-end p-5 lg:p-6 border-2 border-primary rounded-[28px] bg-[url('/noise.svg')] bg-cover w-full h-90 bg-center overflow-hidden hover:shadow-lg transition-all duration-300 ${tiltClass}`}
              >
                {/* Background image overlay */}
                <div
                  className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url('${exp.images && exp.images[0] ? exp.images[0] : "/experience_placeholder.jpg"}')`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-base via-dark-base/40 to-transparent opacity-85 z-1" />

                {/* Remove button */}
                <button
                  onClick={(e) => handleRemove(e, exp.experienceId)}
                  className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white-base/90 text-error hover:bg-white-base hover:scale-110 shadow transition-all cursor-pointer"
                  aria-label="Remove experience from saved"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Card Content */}
                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-primary/95 text-secondary text-extra-small px-3 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm">
                      {exp.category.replace("_", " ")}
                    </span>
                    <span className="text-white-base font-bold text-small-medium">
                      {exp.price.toLocaleString()} NGN
                    </span>
                  </div>

                  <h3 className="text-section-inner-title text-white-base text-[20px] leading-tight">
                    {exp.title}
                  </h3>

                  <p className="text-small text-body-off flex items-center gap-1.5 mt-0.5">
                    <Image
                      src="/location_icon.svg"
                      width={12}
                      height={14}
                      alt="Location icon"
                      className="brightness-200"
                    />
                    {exp.destination}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
