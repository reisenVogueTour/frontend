import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header>
      <nav className="absolute top-5 left-5 lg:left-10 z-50">
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
    </header>
  );
}
