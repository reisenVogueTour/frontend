"use client";

import Image from "next/image";
import { useDestinationModal } from "@/components/home/destinationExperienceModal";
import type { Destination } from "@/lib/types/reisen";

const PLACEHOLDER_IMAGE = "/experience_placeholder.jpg";

export default function FeaturedDestinationsCarousel({
  destinations,
}: {
  destinations: Destination[];
}) {
  const { open, modal } = useDestinationModal();

  return (
    <>
      <div className="flex flex-col items-center gap-5 overflow-visible md:flex-row md:flex-nowrap md:items-end md:gap-10">
        {destinations.map((destination, index) => {
          const tilt = index % 2 === 0 ? "md:-rotate-3" : "md:rotate-3";
          const offset = index % 2 === 0 ? "md:mb-5" : "";

          return (
            <button
              type="button"
              key={`${destination.slug}-${index}`}
              onClick={() => open(destination.slug, destination.name)}
              className={`relative flex flex-col justify-end p-5 lg:p-6 gap-2 w-full sm:w-120 h-120 rounded-[28px] overflow-hidden bg-cover bg-center border-12 border-white-base flex-none card-shadow-primary-glow text-left cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 ${tilt} ${offset}`}
              style={{
                backgroundImage: `url('${destination.imageUrl || PLACEHOLDER_IMAGE}')`,
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_top,#2d2d2dcc_0%,transparent_60%)]" />

              <div className="relative z-1 flex flex-col gap-2">
                <h3 className="text-section-inner-title text-body-light">
                  {destination.name}
                </h3>
                <p className="text-body-regular text-body-off flex items-center gap-2">
                  <Image
                    src="/location_icon.svg"
                    width={16}
                    height={19}
                    alt="Location icon"
                  />
                  {destination.country}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {modal}
    </>
  );
}
