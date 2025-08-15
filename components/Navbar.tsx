"use client";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/Container";
import LanguageToggle from "@/components/LanguageToggle";
import { SupportedLocale } from "@/lib/i18n/locales";
import { useEffect, useState } from "react";
import AnnouncementBanner from "@/components/AnnouncementBanner";

type Dict = {
  nav: {
    visitors: string;
    planners: string;
    tour: string;
    calendar: string;
    contact: string;
  };
};

export default function Navbar({ locale, dict, alwaysSolid = false }: { locale: SupportedLocale; dict: Dict; alwaysSolid?: boolean }) {
  const base = `/${locale}`;
  const leftLinks = [
    { href: `${base}#visitors`, label: dict.nav.visitors },
    { href: `${base}#planners`, label: dict.nav.planners },
  ];
  const rightLinks = [
    { href: `${base}#calendar`, label: dict.nav.calendar },
    // contact removed per request
  ];
  const [tourOpen, setTourOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tourMobileOpen, setTourMobileOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors ${alwaysSolid || scrolled ? "bg-black" : "bg-transparent"}`}>
      {/* Sticky Banner Above Navbar */}
      <AnnouncementBanner />
      <nav aria-label="Primary Navigation">
        <Container className="relative h-20 md:h-24 flex items-center justify-between md:justify-center">
          {/* Mobile left: logo */}
          <div className="flex md:hidden items-center">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Link href={base as any} className="inline-flex items-center">
              <Image src="/images/ui/CCPR%20LOGO%20WHITE4%20(1).png" alt="Puerto Rico Convention Center" width={110} height={26} priority />
            </Link>
          </div>

          {/* Desktop centered row */}
          <div className="hidden md:flex items-center gap-6">
            <ul className="flex items-center gap-3">
              {leftLinks.map((l) => (
                <li key={l.href}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Link className="text-sm font-medium text-white hover:text-sky" href={l.href as any}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Link href={base as any} className="inline-flex items-center pt-1">
              <Image src="/images/ui/CCPR%20LOGO%20WHITE4%20(1).png" alt="Puerto Rico Convention Center" width={140} height={32} priority />
            </Link>
            <ul className="flex items-center gap-3 relative">
              <li className="relative">
                <button
                  type="button"
                  onClick={() => setTourOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setTourOpen(false), 150)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-white hover:text-sky"
                >
                  {dict.nav.tour}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {tourOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-md bg-white text-ink shadow-lg ring-1 ring-black/5">
                    <ul className="py-2 text-sm">
                      <li>
                        <button
                          type="button"
                          onMouseDown={() => window.dispatchEvent(new CustomEvent("open-iframe-modal", { detail: { title: "Virtual Tour - Level I", src: "https://my.matterport.com/show/?m=V9Dc67ohAdK" } }))}
                          className="block w-full text-left px-4 py-2 hover:bg-ink/5"
                        >
                          Level I
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onMouseDown={() => window.dispatchEvent(new CustomEvent("open-iframe-modal", { detail: { title: "Virtual Tour - Level II", src: "https://my.matterport.com/show/?m=shWiBhBBjoy" } }))}
                          className="block w-full text-left px-4 py-2 hover:bg-ink/5"
                        >
                          Level II
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onMouseDown={() => window.dispatchEvent(new CustomEvent("open-iframe-modal", { detail: { title: "Virtual Tour - Level III & Ocean-View Terrace", src: "https://my.matterport.com/show/?m=KeZUKnEmF1n" } }))}
                          className="block w-full text-left px-4 py-2 hover:bg-ink/5"
                        >
                          Level III & Ocean-View Terrace
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
              <li>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Link className="text-sm font-medium text-white hover:text-sky" href={`${base}#calendar` as any}>
                  {dict.nav.calendar}
                </Link>
              </li>
            </ul>
          </div>
          <div className="hidden md:flex items-center gap-4 absolute right-4">
            {/* Socials */}
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer" className="text-white hover:text-sky">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>
            </a>
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer" className="text-white hover:text-sky">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.2 3-3.2.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0 0 22 12"/></svg>
            </a>
            <a href="https://x.com" aria-label="X" target="_blank" rel="noreferrer" className="text-white hover:text-sky">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h3l-7.5 9.5L22 22h-6l-4-5.5L7 22H4l7.5-9.5L2 2h6l3.5 5L18 2z"/></svg>
            </a>
            <LanguageToggle locale={locale} />
          </div>

          {/* Mobile right: hamburger */}
          <div className="md:hidden">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
            >
              <span className="sr-only">Open menu</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </Container>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside id="mobile-menu" className="absolute right-0 top-0 h-full w-72 bg-black text-white p-5 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-center">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Link href={base as any} onClick={() => setMobileOpen(false)} className="inline-flex items-center">
                  <Image src="/images/ui/CCPR%20LOGO%20WHITE4%20(1).png" alt="Puerto Rico Convention Center" width={120} height={28} />
                </Link>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="flex-1">
              <ul className="space-y-4">
                {[...leftLinks].map((l) => (
                  <li key={l.href}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Link href={l.href as any} onClick={() => setMobileOpen(false)} className="block text-base font-medium hover:text-sky">
                      {l.label}
                    </Link>
                  </li>
                ))}
                {/* Virtual Tour accordion */}
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-base font-medium hover:text-sky"
                    onClick={() => setTourMobileOpen((v) => !v)}
                    aria-expanded={tourMobileOpen}
                  >
                    <span>{dict.nav.tour}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform ${tourMobileOpen ? "rotate-180" : "rotate-0"}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {tourMobileOpen && (
                    <ul className="mt-2 space-y-2 pl-3">
                      <li>
                        <button
                          type="button"
                          className="block w-full text-left text-sm text-white/90 hover:text-white"
                          onClick={() => {
                            setMobileOpen(false);
                            window.dispatchEvent(new CustomEvent("open-iframe-modal", { detail: { title: "Virtual Tour - Level I", src: "https://my.matterport.com/show/?m=V9Dc67ohAdK" } }));
                          }}
                        >
                          Level I
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="block w-full text-left text-sm text-white/90 hover:text-white"
                          onClick={() => {
                            setMobileOpen(false);
                            window.dispatchEvent(new CustomEvent("open-iframe-modal", { detail: { title: "Virtual Tour - Level II", src: "https://my.matterport.com/show/?m=shWiBhBBjoy" } }));
                          }}
                        >
                          Level II
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="block w-full text-left text-sm text-white/90 hover:text-white"
                          onClick={() => {
                            setMobileOpen(false);
                            window.dispatchEvent(new CustomEvent("open-iframe-modal", { detail: { title: "Virtual Tour - Level III & Ocean-View Terrace", src: "https://my.matterport.com/show/?m=KeZUKnEmF1n" } }));
                          }}
                        >
                          Level III & Ocean-View Terrace
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
                {/* Calendar link */}
                <li>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Link href={`${base}#calendar` as any} onClick={() => setMobileOpen(false)} className="block text-base font-medium hover:text-sky">
                    {dict.nav.calendar}
                  </Link>
                </li>
              </ul>
            </nav>
            <div>
              <LanguageToggle locale={locale} />
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}


