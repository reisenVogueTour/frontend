import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative bg-primary h-90 lg:h-175 flex items-end">
      <Image
        src="/clouds_footer.webp"
        alt=""
        width={1512}
        height={862}
        sizes="(min-width: 1024px) 100vw, 220vw"
        className="w-[180vw] max-w-none sm:w-full h-auto absolute left-0 bottom-12.5 z-0"
        loading="lazy"
        priority={false}
      />
      <Image
        src="/logo_footer.svg"
        alt="Reisen logo"
        width={1512}
        height={403}
        sizes="100vw"
        className="w-full h-auto"
        loading="lazy"
        priority={false}
      />
    </footer>
  );
}
