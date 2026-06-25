import Hero from "./hero";
import FeaturedExperiences from "./featuredExperiencs";
import CallToAction from "./callToAction";
import HowItWorks from "./howItWorks";
import Advantages from "./advantages";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedExperiences />
      <HowItWorks />
      <Advantages />
      <CallToAction />
    </>
  );
}
