"use client";

import Container from "@/components/Container";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { SupportedLocale } from "@/lib/i18n/locales";

type Dict = {
  partners?: {
    title: string;
  };
};

const PARTNERS = [
  { src: "/images/ui/chrysler2022_white-1.png", alt: "Chrysler" },
  { src: "/images/ui/Clorox-Logo-Grayscale-200-x-68-pixels-1-1.png", alt: "Clorox" },
  { src: "/images/ui/first-bank-logo-e1645564484530.png", alt: "First Bank" },
  { src: "/images/ui/ram2022.png", alt: "RAM" },
  { src: "/images/ui/DISCOVER PUERTO RICO DPR_logo_white.png", alt: "Discover Puerto Rico" },
  { src: "/images/ui/liberty.png", alt: "Liberty" },
] as const;

function PartnerSet({
  setKey,
  height,
  width,
  gapClass,
  wrapperClass,
  imageClass,
}: {
  setKey: string;
  height: number;
  width: number;
  gapClass: string;
  wrapperClass: string;
  imageClass: string;
}) {
  return (
    <div className={`flex items-center ${gapClass} flex-shrink-0`}>
      {PARTNERS.map((partner) => (
        <div key={`${setKey}-${partner.src}`} className={`relative w-auto ${wrapperClass}`}>
          <Image
            src={partner.src}
            alt={partner.alt}
            height={height}
            width={width}
            className={imageClass}
          />
        </div>
      ))}
    </div>
  );
}

export default function PartnersSection({ locale, dict }: { locale: SupportedLocale; dict: Dict }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const desktopCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.5;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;

    const animate = () => {
      scrollAmount = scrollAmount >= maxScroll ? 0 : scrollAmount + scrollSpeed;
      carousel.scrollLeft = scrollAmount;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    const desktopCarousel = desktopCarouselRef.current;
    if (!desktopCarousel) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.7;
    const maxScroll = desktopCarousel.scrollWidth - desktopCarousel.clientWidth;

    const animate = () => {
      scrollAmount = scrollAmount >= maxScroll ? 0 : scrollAmount + scrollSpeed;
      desktopCarousel.scrollLeft = scrollAmount;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="w-full py-6 bg-black">
      <Container>
        {/* Desktop Layout - Animated Carousel */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold text-white">{dict.partners?.title || "Our Partners"}</h2>
          </div>

          <div className="relative overflow-hidden max-w-2xl">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

            <div
              ref={desktopCarouselRef}
              className="flex items-center gap-12 overflow-x-hidden whitespace-nowrap"
              style={{ scrollBehavior: "auto" }}
            >
              <PartnerSet
                setKey="desktop-a"
                height={48}
                width={120}
                gapClass="gap-12"
                wrapperClass="h-12"
                imageClass="object-contain h-12 w-auto"
              />
              <PartnerSet
                setKey="desktop-b"
                height={48}
                width={120}
                gapClass="gap-12"
                wrapperClass="h-12"
                imageClass="object-contain h-12 w-auto"
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout - Animated Carousel */}
        <div className="md:hidden">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <h2 className="text-lg font-bold text-white">{dict.partners?.title || "Our Partners"}</h2>
            </div>

            <div className="relative flex-1 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

              <div
                ref={carouselRef}
                className="flex items-center gap-8 overflow-x-hidden whitespace-nowrap"
                style={{ scrollBehavior: "auto" }}
              >
                <PartnerSet
                  setKey="mobile-a"
                  height={32}
                  width={80}
                  gapClass="gap-8"
                  wrapperClass="h-8"
                  imageClass="object-contain h-8 w-auto"
                />
                <PartnerSet
                  setKey="mobile-b"
                  height={32}
                  width={80}
                  gapClass="gap-8"
                  wrapperClass="h-8"
                  imageClass="object-contain h-8 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
