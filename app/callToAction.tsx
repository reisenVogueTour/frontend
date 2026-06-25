import Link from "next/link";
export default function CallToAction() {
  return (
    <section className="section-wrapper bg-primary items-center">
      <h2 className="text-cta-band-heading text-dark-base max-w-175 text-center opacity-80">
        Tell us where you&apos;re headed, we&apos;ll make it feel like home.
      </h2>
      <Link
        href="/#hero"
        className="primary-cta cursor-pointer block w-fit z-10"
      >
        <span className="primary-cta-inner">Find your next adventure</span>
      </Link>
    </section>
  );
}
