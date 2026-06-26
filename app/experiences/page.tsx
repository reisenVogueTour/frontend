"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchAPI } from "../shared/api";
import { useApp, Experience } from "../shared/AppContext";

const MOCK_EXPERIENCES: Experience[] = [
  {
    experienceId: "exp-lagos-kayak",
    providerId: "prov-1",
    title: "Kayaking in Lagos Lagoons",
    description: "Paddle through Lagos's beautiful lagoons, navigating around fishing communities and catching a breathtaking view of the Lekki-Ikoyi Bridge.",
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
    description: "Dive deep into the historic record shops of Shimokitazawa and enjoy pour-over coffee at tucked-away kissatens with a local music collector.",
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
    description: "Walk inside the private ateliers where modern art was born. Meet working printmakers and paint on canvas overlooking the city.",
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
    description: "Explore the rebellious roots of Camden and Shoreditch, following punk lore and identifying hidden masterpieces by street legends.",
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

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "adventure", label: "Adventure" },
  { value: "relaxation", label: "Relaxation" },
  { value: "nightlife", label: "Nightlife" },
  { value: "cultural", label: "Cultural" },
  { value: "wildlife", label: "Wildlife" },
  { value: "water_sports", label: "Water Sports" },
  { value: "romantic", label: "Romantic" },
  { value: "family_friendly", label: "Family Friendly" },
];

function ExperiencesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toggleSaveExperience, isSaved, token } = useApp();

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state from query parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedDest, setSelectedDest] = useState(searchParams.get("destination") || "");
  const [selectedCat, setSelectedCat] = useState(searchParams.get("category") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedDest) params.set("destination", selectedDest);
    if (selectedCat) params.set("category", selectedCat);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/experiences?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDest("");
    setSelectedCat("");
    setMaxPrice("");
    router.push("/experiences");
  };

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      setError("");

      try {
        const dest = searchParams.get("destination") || "";
        const cat = searchParams.get("category") || "";
        const search = searchParams.get("search") || "";
        const maxP = searchParams.get("maxPrice") || "";

        let query = `/api/experiences?status=published`;
        if (dest) query += `&destination=${encodeURIComponent(dest)}`;
        if (cat) query += `&category=${encodeURIComponent(cat)}`;
        if (search) query += `&search=${encodeURIComponent(search)}`;
        if (maxP) query += `&maxPrice=${maxP}`;

        const result = await fetchAPI<{ items: Experience[] }>(query);
        
        if (result.items && result.items.length > 0) {
          setExperiences(result.items);
        } else {
          // If 0 items returned from backend database, fallback to filtered mock experiences
          let filteredMock = [...MOCK_EXPERIENCES];
          if (dest) {
            filteredMock = filteredMock.filter(exp => 
              exp.destination.toLowerCase().includes(dest.toLowerCase())
            );
          }
          if (cat) {
            filteredMock = filteredMock.filter(exp => exp.category === cat);
          }
          if (search) {
            filteredMock = filteredMock.filter(exp => 
              exp.title.toLowerCase().includes(search.toLowerCase()) || 
              exp.description.toLowerCase().includes(search.toLowerCase())
            );
          }
          if (maxP) {
            filteredMock = filteredMock.filter(exp => exp.price <= Number(maxP));
          }
          setExperiences(filteredMock);
        }
      } catch (err) {
        console.error("Error fetching experiences from API:", err);
        // On error, fallback to filtered mock experiences so the UI is still browsable
        const dest = searchParams.get("destination") || "";
        const cat = searchParams.get("category") || "";
        const search = searchParams.get("search") || "";
        const maxP = searchParams.get("maxPrice") || "";

        let filteredMock = [...MOCK_EXPERIENCES];
        if (dest) {
          filteredMock = filteredMock.filter(exp => 
            exp.destination.toLowerCase().includes(dest.toLowerCase())
          );
        }
        if (cat) {
          filteredMock = filteredMock.filter(exp => exp.category === cat);
        }
        if (search) {
          filteredMock = filteredMock.filter(exp => 
            exp.title.toLowerCase().includes(search.toLowerCase()) || 
            exp.description.toLowerCase().includes(search.toLowerCase())
          );
        }
        if (maxP) {
          filteredMock = filteredMock.filter(exp => exp.price <= Number(maxP));
        }
        setExperiences(filteredMock);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [searchParams]);

  const handleToggleSave = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      await toggleSaveExperience(id);
    } catch (err: any) {
      alert(err.message || "Failed to update saved experiences.");
    }
  };

  return (
    <div className="w-full max-w-400 mx-auto px-5 lg:px-10 pb-20 pt-24 lg:pt-32">
      {/* Header section */}
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-section-title text-dark-base mb-2">Explore Experiences</h1>
        <p className="text-body-medium text-body-dark">
          Find matched activities hosted by local specialists.
        </p>
      </div>

      {/* Filter and Content layout */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Filters sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-white-base border border-body-off rounded-2xl p-6 h-fit shadow-sm">
          <h2 className="text-one-liner-medium text-dark-base mb-4 font-bold border-b pb-2">Filters</h2>
          
          <div className="flex flex-col gap-6">
            {/* Search Input */}
            <div className="flex flex-col gap-2">
              <label className="text-extra-small text-body-dark uppercase">Search</label>
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 text-small border border-body-off rounded-lg bg-white-base text-dark-base focus:outline-none focus:border-secondary"
              />
            </div>

            {/* Destination Select */}
            <div className="flex flex-col gap-2">
              <label className="text-extra-small text-body-dark uppercase">Destination</label>
              <select
                value={selectedDest}
                onChange={(e) => setSelectedDest(e.target.value)}
                className="w-full px-3 py-2 text-small border border-body-off rounded-lg bg-white-base text-dark-base focus:outline-none focus:border-secondary"
              >
                <option value="">All Destinations</option>
                <option value="Lagos">Lagos, Nigeria</option>
                <option value="Tokyo">Tokyo, Japan</option>
                <option value="Paris">Paris, France</option>
                <option value="London">London, UK</option>
              </select>
            </div>

            {/* Category Select */}
            <div className="flex flex-col gap-2">
              <label className="text-extra-small text-body-dark uppercase">Category</label>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full px-3 py-2 text-small border border-body-off rounded-lg bg-white-base text-dark-base focus:outline-none focus:border-secondary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Price Range */}
            <div className="flex flex-col gap-2">
              <label className="text-extra-small text-body-dark uppercase">
                Max Price: {maxPrice ? `${Number(maxPrice).toLocaleString()} NGN` : "Any"}
              </label>
              <input
                type="range"
                min="0"
                max="150000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full accent-secondary"
              />
              <div className="flex justify-between text-[11px] text-body-dark">
                <span>0 NGN</span>
                <span>150k NGN</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={applyFilters}
                className="bg-secondary text-white-base py-2.5 rounded-xl font-bold hover:bg-opacity-95 transition-all text-small cursor-pointer"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="border border-body-off text-body-dark py-2.5 rounded-xl font-medium hover:bg-body-light transition-all text-small cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Listings section */}
        <div className="flex-grow">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-4 border border-body-off rounded-[28px] p-4 bg-white-base">
                  <div className="h-60 bg-body-off rounded-2xl w-full" />
                  <div className="h-6 bg-body-off rounded w-3/4" />
                  <div className="h-4 bg-body-off rounded w-1/2" />
                  <div className="h-4 bg-body-off rounded w-full" />
                </div>
              ))}
            </div>
          ) : experiences.length === 0 ? (
            <div className="text-center py-20 bg-white-base border border-body-off rounded-[28px] p-10 flex flex-col items-center justify-center gap-4">
              <span className="text-section-inner-title text-body-dark">No experiences found</span>
              <p className="text-body-medium text-body-dark max-w-sm">
                Try loosening your filter parameters or search terms to discover more local activities.
              </p>
              <button
                onClick={clearFilters}
                className="primary-cta cursor-pointer mt-2"
              >
                <span className="primary-cta-inner px-6 py-2.5">Clear All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {experiences.map((exp, index) => {
                const tiltClass = index % 2 === 0 ? "hover:rotate-1" : "hover:-rotate-1";
                const isSavedExp = isSaved(exp.experienceId);

                return (
                  <Link
                    key={exp.experienceId}
                    href={`/experiences/${exp.experienceId}`}
                    className={`group relative flex flex-col justify-end p-5 lg:p-8 border-2 border-primary rounded-[28px] bg-[url('/noise.svg')] bg-cover w-full h-100 bg-center overflow-hidden hover:shadow-lg transition-all duration-300 ${tiltClass}`}
                  >
                    {/* Background image overlay */}
                    <div className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url('${exp.images && exp.images[0] ? exp.images[0] : "/experience_placeholder.jpg"}')` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-base via-dark-base/40 to-transparent opacity-85 z-1" />

                    {/* Save Button */}
                    <button
                      onClick={(e) => handleToggleSave(e, exp.experienceId)}
                      className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-white-base/90 text-dark-base hover:bg-white-base hover:scale-110 shadow transition-all cursor-pointer"
                      aria-label="Save experience"
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
                    </button>

                    {/* Card Content */}
                    <div className="relative z-10 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-primary/95 text-secondary text-extra-small px-3 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm">
                          {exp.category.replace("_", " ")}
                        </span>
                        <span className="text-white-base font-bold text-one-liner-medium">
                          {exp.price.toLocaleString()} NGN
                        </span>
                      </div>
                      
                      <h3 className="text-section-inner-title text-white-base leading-tight">
                        {exp.title}
                      </h3>

                      <p className="text-small text-body-off flex items-center gap-1.5">
                        <Image
                          src="/location_icon.svg"
                          width={14}
                          height={16}
                          alt="Location icon"
                          className="brightness-200"
                        />
                        {exp.destination} · {exp.duration || `${exp.numberOfDays} days`}
                      </p>

                      <p className="text-small text-body-off opacity-90 line-clamp-2 mt-1">
                        {exp.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExperiencesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    }>
      <ExperiencesContent />
    </Suspense>
  );
}
