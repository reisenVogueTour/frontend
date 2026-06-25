import Image from "next/image";

const advantages: Readonly<
  Array<{ heading: string; description: string; image: string }>
> = [
  {
    heading: "Local tour guides on demand",
    description:
      "Think of it as a guide on speed dial, so you can explore like you've got a friend in town. One that lives in the area and knows where there are no long lines.",
    image: "/guide_advantage.svg",
  },
  {
    heading: "No cookie-cutter itineraries",
    description:
      "Tell us what you're into, vinyl shops and slow coffee, hidden hiking trails, and Reisen builds a trip around it. No obligatory selfies in front of the thing everyone photographs.",
    image: "/itinerary_advantage.svg",
  },
];

export default function Advantages() {
  return (
    <div className="relative flex flex-col gap-10 px-5 py-10 lg:px-10 lg:py-20 bg-[linear-gradient(to_top,#cfbeea,#f9fafb_80%)] overflow-hidden ">
      <Image
        className="hidden xl:block absolute z-0 right-0 h-full w-1/2"
        src="/advantages_line.svg"
        alt=""
        width={1039}
        height={651}
      />
      {advantages.map((advantage) => (
        <section
          key={advantage.heading}
          className="flex justify-center relative z-1"
        >
          <div className="relative flex flex-col justify-end h-100 lg:h-unset max-w-150 border-2 border-primary rounded-[28px] bg-[url(/noise.svg)] overflow-hidden">
            <Image
              className="absolute top-5 self-center z-1 lg:hidden"
              src={advantage.image}
              alt={advantage.heading}
              width={600}
              height={500}
            />
            <div className="relative z-5 p-5 lg:p-10 flex flex-col justify-end h-3/4 gap-4 bg-[linear-gradient(to_bottom,transparent_0%,#FAF9F695_71%)] lg:bg-none">
              <h2 className="text-section-inner-title text-dark-base z">
                {advantage.heading}
              </h2>
              <p className="text-body-medium text-dark-base">
                {advantage.description}
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center min-w-75 w-full">
            <Image
              className="self-center"
              src={advantage.image}
              alt={advantage.heading}
              width={600}
              height={500}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
