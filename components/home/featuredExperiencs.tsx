"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchAPI } from "../../app/shared/api";
import { Experience } from "../../app/shared/AppContext";


const MOCK_FEATURED: Experience[] = [
  {
    experienceId: "exp-lagos-kayak",
    providerId: "prov-1",
    title: "Kayaking in Lagos Lagoons",
    description: "Paddle through Lagos's lagoons and see the city from the water.",
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
    description: "Dive deep into the historic record shops of Shimokitazawa and enjoy coffee with a collector.",
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
];

export default function FeaturedExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await fetchAPI<Experience[]>("/api/experiences/featured");
        if (data && data.length > 0) {
          setExperiences(data);
        } else {
          setExperiences(MOCK_FEATURED);
        }
      } catch (err) {
        console.error("Failed to load featured experiences, using fallback:", err);
        setExperiences(MOCK_FEATURED);
      } finally {
        setLoading(false);
      }
    };

    loadFeatured();
  }, []);

  return (
    <div className="relative flex justify-center bg-[linear-gradient(to_bottom,#cfbeea,#f9fafb_80%)] bg-cover overflow-hidden">
      <div className="section-wrapper relative">
        <Image
          src="/featured_experiences_heading.svg"
          alt="Need a little inspiration?"
          width={608}
          height={208}
          className="w-100 h-auto lg:w-unset relative z-10"
        />
        <Image
          src="/cloud_hero.webp"
          alt=""
          width={680}
          height={400}
          className="absolute -top-60 z-5"
        />

        <div className="flex flex-col gap-20 w-full items-center mt-10">
          {loading ? (
            <div className="animate-pulse flex flex-col gap-4 w-full max-w-160 lg:w-187.5 h-100 bg-white-base/40 rounded-[28px]" />
          ) : (
            experiences.map((exp, index) => {
              const tilt = index % 2 === 0 ? "neg" : "pos";
              const imageUrl = exp.images && exp.images[0] ? exp.images[0] : "/experience_placeholder.jpg";

              return (
                <Link
                  key={exp.experienceId}
                  href={`/experiences/${exp.experienceId}`}
                  className={`sticky top-10 flex flex-col justify-end p-5 lg:p-10 gap-4 w-full h-100 max-w-160 lg:w-187.5 lg:h-120 bg-cover bg-center rounded-[28px] overflow-hidden group shadow-md transition-all duration-300 ${tilt === "pos" ? "" : "-"
                    }rotate-3`}
                  style={{ backgroundImage: `url('${imageUrl}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-base via-dark-base/30 to-transparent opacity-85 z-1 group-hover:scale-105 transition-transform duration-500" />

                  <div className="relative z-10">
                    <h3 className="text-section-inner-title text-body-light group-hover:text-primary transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-body-regular text-body-off flex gap-2 items-center mt-1.5">
                      <Image
                        src="/location_icon.svg"
                        width={16}
                        height={19}
                        alt="Location icon"
                        className="brightness-200"
                      />
                      {exp.destination} · {exp.duration || `${exp.numberOfDays} days`}
                    </p>
                    <p className="text-body-medium text-body-off mt-2 opacity-90 line-clamp-2">
                      {exp.description}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
