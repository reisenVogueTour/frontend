import { ChevronDown } from "lucide-react";
import type { Destination } from "@/lib/types/reisen";

export default function DestinationSelect({
  destinations,
  value,
  onChange,
  selected,
}: {
  destinations: Destination[];
  value: string;
  onChange: (slug: string) => void;
  selected: Destination | undefined;
}) {
  return (
    <div className="relative flex flex-col gap-2 items-end">
      <div className="flex items-center gap-1">
        <h2 className="max-w-20 lg:max-w-32 truncate text-section-inner-title bg-[linear-gradient(to_bottom,#2d2d2d_35.761%,#666666_69.754%)] bg-clip-text text-transparent font-bold uppercase">
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
