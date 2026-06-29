import Image from "next/image";
import Link from "next/link";
import { experiencesApi, ApiRequestError } from "@/lib/api-client";
import { AlertCircleIcon, AlertTriangle } from "lucide-react";
import type { Experience } from "@/lib/types/reisen";

const FEATURED_LIMIT = 4;
const PLACEHOLDER_IMAGE = "/experience_placeholder.jpg";

type FeaturedResult =
  | { status: "ok"; experiences: Experience[] }
  | { status: "error"; message: string };

async function getFeaturedExperiences(): Promise<FeaturedResult> {
  try {
    const experiences = await experiencesApi.featured(FEATURED_LIMIT);
    return { status: "ok", experiences: experiences.slice(0, FEATURED_LIMIT) };
  } catch (error) {
    const message =
      error instanceof ApiRequestError
        ? error.message
        : "Something went wrong while loading featured experiences.";
    return { status: "error", message };
  }
}

function StateMessage({
  type,
  children,
}: {
  type: "error" | "info";
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full max-w-160 flex-col items-center gap-3 text-center">
      {type === "error" ? (
        <AlertTriangle size={40} className="text-error" />
      ) : (
        <AlertCircleIcon size={40} className="text-info" />
      )}
      <p
        className={`text-body-regular ${type === "error" ? "text-error" : "text-body-dark"}`}
      >
        {children}
      </p>
    </div>
  );
}

export default async function FeaturedExperiences() {
  const result = await getFeaturedExperiences();

  return (
    <div className="relative flex justify-center bg-[linear-gradient(to_bottom,#cfbeea,#f9fafb_80%)] bg-cover">
      <div className="section-wrapper relative">
        <Image
          src="/featured_experiences_heading.svg"
          alt="Need a little inspiration?"
          width={608}
          height={208}
          className="w-140 h-auto lg:w-unset"
        />
        <Image
          src="/cloud_hero.webp"
          alt=""
          width={680}
          height={400}
          className="absolute -top-60 z-5"
        />

        <div className="flex flex-col gap-20 w-full items-center">
          {result.status === "error" ? (
            <StateMessage type="error">{result.message}</StateMessage>
          ) : result.experiences.length === 0 ? (
            <StateMessage type="info">
              Check back soon, new adventures are added all the time.
            </StateMessage>
          ) : (
            result.experiences.map((experience, index) => {
              const tilt = index % 2 === 0 ? "-rotate-3" : "rotate-3";
              const backgroundImage =
                experience.images?.[0] ?? PLACEHOLDER_IMAGE;

              return (
                <Link
                  key={experience.experienceId}
                  href={`/experiences/${experience.experienceId}`}
                  style={{ backgroundImage: `url('${backgroundImage}')` }}
                  className={`sticky top-10 flex flex-col justify-end p-5 lg:p-10 gap-4 w-full h-100 max-w-160 lg:w-187.5 lg:h-120 bg-cover bg-center rounded-[28px] border-12 border-white-base card-shadow-primary-glow ${tilt} overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,#2d2d2dcc_0%,transparent_60%)] z-1" />

                  <h3 className="text-section-inner-title text-body-light z-2">
                    {experience.title}
                  </h3>
                  <p className="text-body-regular text-body-off flex gap-2 z-2">
                    <Image
                      src="/location_icon.svg"
                      width={16}
                      height={19}
                      alt="Location icon"
                    />
                    {experience.destination}
                  </p>
                  <p className="text-body-medium text-body-off z-2">
                    {experience.description}
                  </p>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
