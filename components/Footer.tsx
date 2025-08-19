"use client";
import Container from "@/components/Container";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SupportedLocale } from "@/lib/i18n/locales";

// Extend Window interface for Osano
declare global {
  interface Window {
    Osano?: {
      cm?: {
        showDrawer: (dialog: string) => void;
      };
    };
  }
}

type Dict = {
  footer?: {
    termsOfUse: string;
    privacyPolicy: string;
    doNotSell: string;
    cookiesPreferences: string;
    awards: string;
    plannerResources: string;
    contactUs: string;
    discoverPuertoRico: string;
    copyright: string;
  };
};

export default function Footer({ locale, dict }: { locale: SupportedLocale; dict: Dict }) {
  const [, setPartners] = useState<string[]>([]);
  useEffect(() => {
    let mounted = true;
    fetch("/api/sponsors")
      .then((r) => r.json())
      .then((data: { images: string[] }) => {
        if (!mounted) return;
        setPartners(data.images || []);
      })
      .catch(() => setPartners([]));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer className="bg-black text-white border-t border-black">
      <Container className="py-10">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6">
              <Image src="/images/ui/CCPR%20LOGO%20WHITE4%20(1).png" alt="PRCC" width={140} height={36} />
              <div className="flex items-center gap-4 opacity-80">
                <Image src="/images/ui/DISTRICT WHITE.png" alt="District" width={100} height={28} />
                <Image src="/images/ui/ASM WHITE.png" alt="ASM Global" width={80} height={24} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <a href="tel:+17876417722" className="hover:text-white transition-colors">
                  (787) 641-7722
                </a>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-10 5L2 7"/>
                </svg>
                <a href="mailto:info@prconvention.com" className="hover:text-white transition-colors">
                  info@prconvention.com
                </a>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/terms`} className="hover:underline">
                  {dict.footer?.termsOfUse || "Terms of Use"}
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.asmglobal.com/p/other/privacy-policy-23" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {dict.footer?.privacyPolicy || "Privacy Policy"}
                </a>
              </li>
              <li>
                <a 
                  href="https://www.asmglobal.com/p/other/privacy-request" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {dict.footer?.doNotSell || "Do Not Sell/Share"}
                </a>
              </li>
            </ul>
            <ul className="space-y-2">
              <li>
                <button
                  className="hover:underline text-left"
                  onClick={() => {
                    // Trigger Osano Cookie Preferences
                    if (typeof window !== 'undefined' && (window as any).Osano && (window as any).Osano.cm) {
                      (window as any).Osano.cm.showDrawer('osano-cm-dom-info-dialog-open');
                    }
                  }}
                >
                  {dict.footer?.cookiesPreferences || "Cookies Preferences"}
                </button>
              </li>
              <li>
                <button
                  className="hover:underline text-left"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-awards-modal'))}
                >
                  {dict.footer?.awards || "Awards"}
                </button>
              </li>
              <li>
                <Link 
                  href={`/${locale}/planners`} 
                  className="hover:underline"
                >
                  {dict.footer?.plannerResources || "Planner Resources"}
                </Link>
              </li>
            </ul>
            <ul className="space-y-2">
              <li>
                <button
                  className="hover:underline text-left"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-chat-modal'))}
                >
                  {dict.footer?.contactUs || "Contact Us"}
                </button>
              </li>
              <li>
                <a 
                  href="https://www.discoverpuertorico.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {dict.footer?.discoverPuertoRico || "Discover Puerto Rico"}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 border-t border-white/10 pt-6 flex items-center justify-between text-xs text-white/70">
          <p>© {new Date().getFullYear()} {dict.footer?.copyright || "Puerto Rico Convention Center"}</p>
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/prconvention/" aria-label="Instagram" target="_blank" rel="noreferrer" className="hover:text-sky">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>
            </a>
            <a href="https://www.facebook.com/prconvention/" aria-label="Facebook" target="_blank" rel="noreferrer" className="hover:text-sky">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.2 3-3.2.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0 0 22 12"/></svg>
            </a>
            <a href="https://twitter.com/prconvention" aria-label="X" target="_blank" rel="noreferrer" className="hover:text-sky">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h3l-7.5 9.5L22 22h-6l-4-5.5L7 22H4l7.5-9.5L2 2h6l3.5 5L18 2z"/></svg>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}


