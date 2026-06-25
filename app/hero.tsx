import ExperienceForm from "./experienceForm";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col gap-10 items-center justify-center h-svh w-svw max-w-378 bg-[url(/hero_bg.webp)] bg-cover bg-center overflow-hidden px-5 lg:px-10"
    >
      <div
        aria-hidden
        className="z-2 pointer-events-none absolute w-full h-1/2 bottom-0 backdrop-blur-xl bg-primary mask-[linear-gradient(to_top,#cfbeea_20%,transparent)]"
      />
      <Image
        src="/airplane_wing.webp"
        width={1068}
        height={832}
        alt=""
        className="absolute bottom-[-50%] z-1"
      />
      <h1 className="relative z-3 text-dark-base text-hero text-center max-w-85 lg:max-w-175 opacity-80">
        Travel like you belong there
      </h1>
      <div className="relative z-10">
        <ExperienceForm />
      </div>
    </section>
  );
}
