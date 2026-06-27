import AuthAwareAdventureLink from "@/components/shared/AuthAwareAdventureLink";

export default function CallToAction() {
  return (
    <section className="flex justify-center bg-primary items-center">
      <div className="section-wrapper">
        <h2 className="text-cta-band-heading text-dark-base max-w-175 text-center opacity-80">
          Tell us where you&apos;re headed, we&apos;ll make it feel like home.
        </h2>
        <AuthAwareAdventureLink className="primary-cta cursor-pointer block w-fit z-10" />
      </div>
    </section>
  );
}
