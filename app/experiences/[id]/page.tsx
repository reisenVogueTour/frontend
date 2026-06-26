"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { fetchAPI } from "../../shared/api";
import { useApp, Experience } from "../../shared/AppContext";

const MOCK_EXPERIENCES: Experience[] = [
  {
    experienceId: "exp-lagos-kayak",
    providerId: "prov-1",
    title: "Kayaking in Lagos Lagoons",
    description: "Paddle through Lagos's beautiful lagoons, navigating around fishing communities and catching a breathtaking view of the Lekki-Ikoyi Bridge. Enjoy this unique visual perspective of the aquatic city, guided by certified local kayakers who know the best trails, local landmarks, and safety procedures.",
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
    description: "Dive deep into the historic record shops of Shimokitazawa and enjoy pour-over coffee at tucked-away kissatens with a local music collector. Uncover rare jazz pressings, learn about Tokyo's unique audiophile culture, and enjoy quiet moments in the busiest metropolis in the world.",
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
    description: "Walk inside the private ateliers where modern art was born. Meet working printmakers and paint on canvas overlooking the city. Take a step back in time, wandering through cobblestone alleys and seeing Paris through the eyes of Picasso, Modigliani, and Van Gogh.",
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
    description: "Explore the rebellious roots of Camden and Shoreditch, following punk lore and identifying hidden masterpieces by street legends. See Banksy originals, visit famous record stores, and trace the history of subculture movements that shaped the modern music world.",
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

export default function ExperienceDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { addToCart, toggleSaveExperience, isSaved, token } = useApp();

  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking states
  const [requestedDate, setRequestedDate] = useState("");
  const [groupSize, setGroupSize] = useState(1);
  const [notes, setNotes] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  useEffect(() => {
    const fetchExperience = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchAPI<Experience>(`/api/experiences/${id}`);
        setExperience(data);
        // Default date input to experience's event date
        if (data.eventDate) {
          setRequestedDate(data.eventDate.substring(0, 16)); // Format for datetime-local
        }
      } catch (err) {
        console.error("Failed to load experience details from API, using fallback:", err);
        // Check fallback mock experiences
        const fallback = MOCK_EXPERIENCES.find((exp) => exp.experienceId === id);
        if (fallback) {
          setExperience(fallback);
          if (fallback.eventDate) {
            setRequestedDate(fallback.eventDate.substring(0, 16));
          }
        } else {
          setError("Experience not found.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExperience();
    }
  }, [id]);

  const handleToggleSave = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (!experience) return;
    try {
      await toggleSaveExperience(experience.experienceId);
    } catch (err: any) {
      alert(err.message || "Failed to update saved experiences.");
    }
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!experience) return;

    if (!requestedDate) {
      alert("Please select a date for the experience.");
      return;
    }

    // Convert date input back to ISO string for backend compatibility
    const isoDate = new Date(requestedDate).toISOString();

    addToCart(experience, isoDate, groupSize, notes);
    setAddedMessage("Successfully added to cart!");
    setTimeout(() => setAddedMessage(""), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-5 text-center gap-4">
        <h1 className="text-section-title text-dark-base">Something went wrong</h1>
        <p className="text-body-medium text-body-dark max-w-sm">
          {error || "We couldn't load the experience details. Please check the URL or try again later."}
        </p>
        <button
          onClick={() => router.push("/experiences")}
          className="bg-secondary text-white-base px-6 py-3 rounded-full font-bold text-small cursor-pointer"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  const isSavedExp = isSaved(experience.experienceId);

  return (
    <div className="w-full max-w-400 mx-auto px-5 lg:px-10 pb-20 pt-24 lg:pt-32">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 text-one-liner-medium text-body-dark hover:text-secondary cursor-pointer transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Go back
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Experience Details Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main image */}
          <div className="relative w-full h-80 sm:h-110 rounded-[28px] overflow-hidden border border-body-off shadow-inner">
            <Image
              src={experience.images && experience.images[0] ? experience.images[0] : "/experience_placeholder.jpg"}
              alt={experience.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 66vw, 100vw"
              priority
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
            <span className="bg-primary/50 text-secondary text-extra-small px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
              {experience.category.replace("_", " ")}
            </span>
            <button
              onClick={handleToggleSave}
              className="flex items-center gap-2 px-4 py-2 border border-primary rounded-full hover:bg-primary-50 transition-all font-bold text-small text-dark-base cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isSavedExp ? "#7f5ccc" : "none"}
                stroke={isSavedExp ? "#7f5ccc" : "#2d2d2d"}
                strokeWidth="2.5"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {isSavedExp ? "Saved in Wishlist" : "Save to Wishlist"}
            </button>
          </div>

          <h1 className="text-hero text-dark-base mt-2">{experience.title}</h1>

          <div className="flex flex-wrap gap-6 text-one-liner text-body-dark border-y border-body-off py-4 mt-2">
            <span className="flex items-center gap-1.5">
              <Image src="/location_icon.svg" width={14} height={16} alt="Location" />
              {experience.destination}
            </span>
            <span>·</span>
            <span>Duration: {experience.duration || `${experience.numberOfDays} days`}</span>
            <span>·</span>
            <span>Max Group Size: {experience.maxGroupSize} people</span>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <h2 className="text-section-inner-title text-dark-base">About this experience</h2>
            <p className="text-body-regular text-dark-base whitespace-pre-line leading-relaxed">
              {experience.description}
            </p>
          </div>
        </div>

        {/* Booking / Checkout column */}
        <div className="w-full bg-white-base border-2 border-primary rounded-[28px] p-6 lg:p-8 shadow-sm relative overflow-hidden bg-[url('/noise.svg')] bg-cover">
          <h2 className="text-section-inner-title text-dark-base mb-2">Book Experience</h2>
          <div className="text-cta-band-heading text-secondary font-bold mb-6">
            {experience.price.toLocaleString()} NGN <span className="text-small text-body-dark font-medium">/ person</span>
          </div>

          {addedMessage && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 text-success text-small border border-green-200">
              {addedMessage}
            </div>
          )}

          <form onSubmit={handleAddToCart} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="date" className="text-small-medium text-dark-base">
                Select Date & Time
              </label>
              <input
                id="date"
                type="datetime-local"
                required
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-body-off bg-white-base text-dark-base focus:outline-none focus:border-secondary text-body-regular transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="groupSize" className="text-small-medium text-dark-base">
                Group Size (Max {experience.maxGroupSize})
              </label>
              <input
                id="groupSize"
                type="number"
                min="1"
                max={experience.maxGroupSize}
                required
                value={groupSize}
                onChange={(e) => setGroupSize(Math.max(1, Math.min(experience.maxGroupSize, Number(e.target.value))))}
                className="w-full px-4 py-3 rounded-xl border border-body-off bg-white-base text-dark-base focus:outline-none focus:border-secondary text-body-regular transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="notes" className="text-small-medium text-dark-base">
                Notes for the Guide (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Let the provider know if you have specific interests, restrictions or requirements."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-body-off bg-white-base text-dark-base focus:outline-none focus:border-secondary text-body-regular transition-all resize-none"
              />
            </div>

            <div className="mt-4 pt-4 border-t border-body-off flex items-center justify-between text-body-medium text-dark-base font-bold">
              <span>Total Price</span>
              <span>{(experience.price * groupSize).toLocaleString()} NGN</span>
            </div>

            <button type="submit" className="primary-cta w-full cursor-pointer mt-4">
              <span className="primary-cta-inner w-full py-3.5 block">Add to Cart</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
