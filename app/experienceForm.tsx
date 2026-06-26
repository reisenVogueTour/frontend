"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Destination = { code: string; city: string };

const DESTINATIONS: Destination[] = [
  { code: "LOS", city: "Lagos, Nigeria" },
  { code: "TYO", city: "Tokyo, Japan" },
  { code: "LHR", city: "London, UK" },
  { code: "JFK", city: "New York, USA" },
  { code: "CDG", city: "Paris, France" },
  { code: "DXB", city: "Dubai, UAE" },
  { code: "GRU", city: "São Paulo, Brazil" },
  { code: "CPT", city: "Cape Town, South Africa" },
];

function DestinationSelect({
  name,
  label,
  value,
  onChange,
  align = "start",
}: {
  name: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
  align?: "start" | "end";
}) {
  const selected =
    DESTINATIONS.find((destination) => destination.code === value) ??
    DESTINATIONS[0];

  return (
    <div
      className={`relative flex flex-col gap-2 ${
        align === "end" ? "items-end text-right" : "items-start text-left"
      }`}
    >
      <h2 className="text-section-inner-title bg-[linear-gradient(to_bottom,#2d2d2d_35.761%,#666666_69.754%)] bg-clip-text text-transparent font-bold">
        {selected.code}
      </h2>
      <span className="text-one-liner text-dark-base">{selected.city}</span>
      <select
        name={name}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {DESTINATIONS.map((destination) => (
          <option key={destination.code} value={destination.code}>
            {destination.code} — {destination.city}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ExperienceForm() {
  const [origin, setOrigin] = useState("LOS");
  const [destination, setDestination] = useState("TYO");

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
          <div className="flex items-start justify-between">
            <DestinationSelect
              name="origin"
              label="Origin"
              value={origin}
              onChange={setOrigin}
              align="start"
            />
            <DestinationSelect
              name="destination"
              label="Destination"
              value={destination}
              onChange={setDestination}
              align="end"
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

      <Link href="/auth" className="primary-cta cursor-pointer">
        <span className="primary-cta-inner">Find your next adventure</span>
      </Link>
    </div>
  );
}
