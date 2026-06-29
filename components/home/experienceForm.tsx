"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import DestinationExperienceModal from "@/components/home/destinationExperienceModal";
import { api } from "@/lib/api-client";
import type { Destination } from "@/lib/types/reisen";

function DestinationSelect({
  destinations,
  value,
  onChange,
}: {
  destinations: Destination[];
  value: string;
  onChange: (slug: string) => void;
}) {
  const selected = destinations.find((d) => d.slug === value);

  return (
    <div className="relative flex flex-col gap-2 items-end">
      <div className="flex items-center gap-1">
        <h2 className="max-w-32 truncate text-section-inner-title bg-[linear-gradient(to_bottom,#2d2d2d_35.761%,#666666_69.754%)] bg-clip-text text-transparent font-bold uppercase">
          {selected?.name ?? "Select"}
        </h2>
        <ChevronDown size={20} className="text-body-dark" aria-hidden />
      </div>

      <select
        name="destination"
        aria-label="Destination"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {destinations.map((destination, index) => {
          console.log(destinations);
          return (
            <option
              key={`{destination.slug}-${index}`}
              value={destination.slug}
            >
              {destination.name}, {destination.country}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default function ExperienceForm() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destination, setDestination] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.destinations.list().then((data) => setDestinations(data.items));
  }, []);

  const selected = destinations.find((d) => d.slug === destination);
  console.log(selected?.slug);

  return (
    <div className="flex flex-col items-center gap-10 relative z-3">
      <div className="relative min-w-50 max-w-75 lg:max-w-full aspect-408/192 ">
        <Image
          src="/ticket_bg.svg"
          alt=""
          fill
          sizes="408px"
          className="object-contain"
          priority
        />

        <div className="relative z-10 flex h-full flex-col justify-center gap-6 px-10 py-8">
          <div className="flex justify-between">
            <h2 className="text-section-inner-title bg-[linear-gradient(to_bottom,#2d2d2d_35.761%,#666666_69.754%)] bg-clip-text text-transparent font-bold uppercase">
              Start
            </h2>
            <DestinationSelect
              destinations={destinations}
              value={destination}
              onChange={setDestination}
            />
          </div>

          <Image
            src="/flight_path_home.svg"
            alt=""
            width={339}
            height={11}
            className="w-full h-auto"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        disabled={!selected}
        className="primary-cta cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="primary-cta-inner">Find your next adventure</span>
      </button>

      {modalOpen && selected && (
        <DestinationExperienceModal
          slug={selected.slug}
          destinationName={selected.name}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
