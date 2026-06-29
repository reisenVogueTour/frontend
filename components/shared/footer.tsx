"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/ai-recommendations")) return null;
  return (
    <footer className="relative flex justify-center bg-primary h-90 lg:h-175">
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
      <div className="flex items-end max-w-400 justify-end overflow-visible">
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
      </div>
    </footer>
  );
}
