import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/constants";

export function Logo() {
  return (
    <Link
      href="/"
      className="font-sans text-headline-md font-bold tracking-tighter text-on-surface flex items-center gap-2 select-none"
    >
      <Image
        src="/logo-white.png"
        alt="SAPI"
        width={32}
        height={32}
        className="w-8 h-8 rounded"
        priority
      />
      {SITE.name}
    </Link>
  );
}

export function LogoSmall() {
  return (
    <Link
      href="/"
      className="font-sans text-headline-md font-bold tracking-tighter text-on-surface flex items-center justify-center select-none"
    >
      <Image
        src="/logo-white.png"
        alt="SAPI"
        width={28}
        height={28}
        className="w-7 h-7 rounded"
        priority
      />
    </Link>
  );
}
