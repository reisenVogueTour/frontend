import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="absolute top-0 left-0 z-50 w-full flex justify-center">
      <div className="p-5 lg:p-10 lg:py-5 w-full max-w-400">
        <nav>
          <Link href="/">
            <Image
              className="w-24 h-auto lg:w-28"
              src="/logo.svg"
              alt="Reisen Logo"
              height={32}
              width={113}
            />
          </Link>
        </nav>
      </div>
    </header>
  );
}
