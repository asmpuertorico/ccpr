"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SupportedLocale } from "@/lib/i18n/locales";

export default function LanguageToggle({ locale, isSolid }: { locale: SupportedLocale; isSolid?: boolean }) {
  const pathname = usePathname();
  // Assumes /[locale]/... structure
  const other = locale === "en" ? "es" : "en";
  const parts = pathname?.split("/") ?? [];
  if (parts.length > 1) parts[1] = other;
  const href: string = parts.join("/") || `/${other}`;
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link href={href as any} className={`text-sm font-medium hover:underline flex items-center gap-1 ${isSolid ? "text-gray-900 hover:text-[#10a0c6]" : "text-white"}`}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      {other.toUpperCase()}
    </Link>
  );
}


