import Image from "next/image";
import type { Destination } from "@/lib/types/reisen";

const PLACEHOLDER_IMAGE = "/experience_placeholder.jpg";

export default function DestinationCard({
  destination,
  onOpen,
}: {
  destination: Destination;
  onOpen: (slug: string, name: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(destination.slug, destination.name)}
      className="relative z-10 flex h-105 w-full flex-col justify-end gap-2 overflow-hidden rounded-2xl border-12 border-white-base bg-cover bg-center p-5 text-left shadow-[0_0_4px_#2d2d2d25] transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer"
      style={{
        backgroundImage: `url('${destination.imageUrl || PLACEHOLDER_IMAGE}')`,
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_top,#2d2d2dcc_0%,transparent_60%)]" />

      <div className="flex relative z-1 flex-col gap-2">
        <h3 className="text-section-inner-title text-body-light">
          {destination.name}
        </h3>
        <p className="flex items-center gap-2 text-body-regular text-body-off">
          <Image
            src="/location_icon.svg"
            width={28}
            height={28}
            alt="Location icon"
          />
          {destination.country}
        </p>
      </div>
    </button>
  );
}
