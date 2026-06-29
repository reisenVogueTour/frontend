import Hero from "../components/home/hero";
import FeaturedExperiences from "../components/home/featuredExperiencs";
import FeaturedDestinations from "../components/home/featuredDestinations";
import CallToAction from "../components/home/callToAction";
import HowItWorks from "../components/home/howItWorks";
import Advantages from "../components/home/advantages";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedExperiences />
      <FeaturedDestinations />
      <HowItWorks />
      <Advantages />
      <CallToAction />
    </>
  );
}
