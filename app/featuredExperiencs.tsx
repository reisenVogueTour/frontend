import Image from "next/image";

export default function FeaturedExperiences() {
  return (
    <div className="relative flex flex-col gap-10 items-center bg-[linear-gradient(to_bottom,#cfbeea,#f9fafb_80%)] bg-cover py-10 px-5 lg:py-20 lg:px-10">
      <Image
        src="/featured_experiences_heading.svg"
        alt="Need a little inspiration?"
        width={608}
        height={208}
        className="w-100 h-auto lg:w-unset"
      />
      <Image
        src="/cloud_hero.webp"
        alt=""
        width={680}
        height={400}
        className="absolute -top-60 z-5"
      />

      <div className="flex flex-col gap-20 w-full items-center">
        {(function () {
          let tilt: "pos" | "neg" = "neg";
          return Array.from({ length: 4 }).map((_, index) => {
            tilt = tilt === "pos" ? "neg" : "pos";
            return (
              <div
                key={index}
                className={`sticky top-10 flex flex-col justify-end p-5 lg:p-10 gap-4 bg-[url('/experience_placeholder.jpg')] w-full h-100 max-w-160 lg:w-187.5 lg:h-120 bg-cover bg-center rounded-[28px] ${tilt === "pos" ? "-" : ""}rotate-3`}
              >
                <h3 className="text-section-inner-title text-body-light">
                  Kayaking in Lagos
                </h3>
                <p className="text-body-regular text-body-off flex gap-2">
                  <Image
                    src="/location_icon.svg"
                    width={16}
                    height={19}
                    alt="Location icon"
                  />
                  Lagos, Nigeria
                </p>
                <p className="text-body-medium text-body-off">
                  Paddle through Lagos&apos;s lagoons and see the city from the
                  water.
                </p>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}
