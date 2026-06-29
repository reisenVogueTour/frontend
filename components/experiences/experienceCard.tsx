import Link from "next/link";
import { MapPin, Compass, Sparkles, Clock, ImageIcon } from "lucide-react";
import { formatPrice } from "@/lib/format";
import SaveButton from "@/components/experiences/saveButton";
import type { Experience } from "@/lib/types/reisen";

export default function ExperienceCard({
  experience,
  highlighted = false,
  onSavedChange,
}: {
  experience: Experience;
  highlighted?: boolean;
  onSavedChange?: (saved: boolean) => void;
}) {
  const image = experience.images?.[0];

  return (
    <article className="relative flex flex-col w-full rounded-2xl bg-white-base p-3 pb-10 shadow-[0_0_4px_#2d2d2d25] transition-transform duration-300 hover:-translate-y-1.5 z-1">
      <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-primary-50">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={experience.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-50/50">
            <ImageIcon size={32} className="text-dark-base/70" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/10" />

        {highlighted && (
          <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white-base/90 px-2.5 py-1 text-extra-small text-secondary">
            <Sparkles size={11} /> AI pick
          </span>
        )}

        {experience.duration && (
          <span className="absolute bottom-4 left-4 flex items-center gap-1 bg-dark-base/80 px-3 py-2 text-small text-white-base rounded-2xl stroke-1 stroke-dark-base">
            <Clock size={16} /> {experience.duration}
          </span>
        )}

        <SaveButton
          experienceId={experience.experienceId}
          onSavedChange={onSavedChange}
          className="absolute right-3 top-3 z-20"
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <h3 className="line-clamp-1 text-section-inner-title text-dark-base">
          <Link
            href={`/experiences/${experience.experienceId}`}
            className="after:absolute after:inset-0"
          >
            {experience.title}
          </Link>
        </h3>
        <p className="flex items-center gap-1 text-small text-body-dark">
          <MapPin size={16} /> {experience.destination}
        </p>
        <p className="text-body-regular text-body-dark">
          from{" "}
          <span className="text-body-medium text-success">
            {formatPrice(experience.price, experience.currency)}
          </span>{" "}
          /person
        </p>
      </div>
    </article>
  );
}
