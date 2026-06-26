import Hero from "../components/home/hero";
import FeaturedExperiences from "../components/home/featuredExperiencs";
import CallToAction from "../components/home/callToAction";
import HowItWorks from "../components/home/howItWorks";
import Advantages from "../components/home/advantages";

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
