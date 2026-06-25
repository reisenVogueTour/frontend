import Image from "next/image";

const steps: Readonly<Array<{ heading: string; description: string }>> = [
  {
    heading: "Pick your destination",
    description: "Tell us where your next adventure is on the map.",
  },
  {
    heading: "Tell us your taste",
    description:
      "Share what you love, food, art, nightlife, nature, the weird and wonderful. The more specific, the better.",
  },
  {
    heading: "Get your match",
    description:
      "Reisen builds a personalised trip and pairs you with local guides who know the place inside out.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-white-base px-5 py-10 lg:py-20 lg:px-10 flex flex-col gap-10 items-center">
      <Image
        src="/steps_line.svg"
        alt=""
        width={1044}
        height={194}
        className="absolute -top-7 hidden lg:block"
      />
      <h2 className="text-section-title text-secondary">How it works</h2>
      <div className="flex flex-col lg:flex-row gap-10 lg:justify-between items-center w-full">
        {steps.map((step, index) => (
          <div
            key={step.heading}
            className="flex flex-col gap-4 max-w-100 text-center text-dark-base"
          >
            <span className="text-section-title">{index + 1}</span>
            <h3 className="text-section-inner-title">{step.heading}</h3>
            <p className="text-body-medium">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
