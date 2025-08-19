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

export default function PartnersSection({ locale, dict }: { locale: SupportedLocale; dict: Dict }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const desktopCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mobile carousel animation
    const carousel = carouselRef.current;
    if (carousel) {
      let scrollAmount = 0;
      const scrollSpeed = 0.5; // pixels per frame
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;

      const animate = () => {
        if (scrollAmount >= maxScroll) {
          scrollAmount = 0;
        } else {
          scrollAmount += scrollSpeed;
        }
        
        carousel.scrollLeft = scrollAmount;
        requestAnimationFrame(animate);
      };

      const animationId = requestAnimationFrame(animate);
      
      return () => {
        cancelAnimationFrame(animationId);
      };
    }
  }, []);

  useEffect(() => {
    // Desktop carousel animation
    const desktopCarousel = desktopCarouselRef.current;
    if (desktopCarousel) {
      let scrollAmount = 0;
      const scrollSpeed = 0.7; // slightly faster for desktop
      const maxScroll = desktopCarousel.scrollWidth - desktopCarousel.clientWidth;

      const animate = () => {
        if (scrollAmount >= maxScroll) {
          scrollAmount = 0;
        } else {
          scrollAmount += scrollSpeed;
        }
        
        desktopCarousel.scrollLeft = scrollAmount;
        requestAnimationFrame(animate);
      };

      const animationId = requestAnimationFrame(animate);
      
      return () => {
        cancelAnimationFrame(animationId);
      };
    }
  }, []);

  return (
    <section className="w-full py-6 bg-black">
      <Container>
        {/* Desktop Layout - Animated Carousel */}
        <div className="hidden md:flex items-center justify-between">
          {/* Our Partners Title */}
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold text-white">{dict.partners?.title || "Our Partners"}</h2>
          </div>
          
          {/* Desktop Carousel Container with Gradient Fade */}
          <div className="relative overflow-hidden max-w-2xl">
            {/* Left Gradient Fade */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
            
            {/* Right Gradient Fade */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
            
            {/* Scrolling Logos */}
            <div 
              ref={desktopCarouselRef}
              className="flex items-center gap-12 overflow-x-hidden whitespace-nowrap"
              style={{ scrollBehavior: 'auto' }}
            >
              {/* First Set of Logos */}
              <div className="flex items-center gap-12 flex-shrink-0">
                <div className="relative h-12 w-auto">
                  <Image
                    src="/images/ui/chrysler2022_white-1.png"
                    alt="Chrysler"
                    height={48}
                    width={120}
                    className="object-contain h-12 w-auto"
                  />
                </div>
                
                <div className="relative h-12 w-auto">
                  <Image
                    src="/images/ui/Clorox-Logo-Grayscale-200-x-68-pixels-1-1.png"
                    alt="Clorox"
                    height={48}
                    width={120}
                    className="object-contain h-12 w-auto"
                  />
                </div>
                
                <div className="relative h-12 w-auto">
                  <Image
                    src="/images/ui/first-bank-logo-e1645564484530.png"
                    alt="First Bank"
                    height={48}
                    width={120}
                    className="object-contain h-12 w-auto"
                  />
                </div>
                
                <div className="relative h-12 w-auto">
                  <Image
                    src="/images/ui/ram2022.png"
                    alt="RAM"
                    height={48}
                    width={120}
                    className="object-contain h-12 w-auto"
                  />
                </div>

                <div className="relative h-12 w-auto">
                  <Image
                    src="/images/ui/DISCOVER PUERTO RICO DPR_logo_white.png"
                    alt="Discover Puerto Rico"
                    height={48}
                    width={120}
                    className="object-contain h-12 w-auto"
                  />
                </div>
              </div>
              
              {/* Second Set of Logos for Seamless Loop */}
              <div className="flex items-center gap-12 flex-shrink-0">
                <div className="relative h-12 w-auto">
                  <Image
                    src="/images/ui/chrysler2022_white-1.png"
                    alt="Chrysler"
                    height={48}
                    width={120}
                    className="object-contain h-12 w-auto"
                  />
                </div>
                
                <div className="relative h-12 w-auto">
                  <Image
                    src="/images/ui/Clorox-Logo-Grayscale-200-x-68-pixels-1-1.png"
                    alt="Clorox"
                    height={48}
                    width={120}
                    className="object-contain h-12 w-auto"
                  />
                </div>
                
                <div className="relative h-12 w-auto">
                  <Image
                    src="/images/ui/first-bank-logo-e1645564484530.png"
                    alt="First Bank"
                    height={48}
                    width={120}
                    className="object-contain h-12 w-auto"
                  />
                </div>
                
                <div className="relative h-12 w-auto">
                  <Image
                    src="/images/ui/ram2022.png"
                    alt="RAM"
                    height={48}
                    width={120}
                    className="object-contain h-12 w-auto"
                  />
                </div>

                <div className="relative h-12 w-auto">
                  <Image
                    src="/images/ui/DISCOVER PUERTO RICO DPR_logo_white.png"
                    alt="Discover Puerto Rico"
                    height={48}
                    width={120}
                    className="object-contain h-12 w-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout - Animated Carousel */}
        <div className="md:hidden">
          <div className="flex items-center gap-6">
            {/* Our Partners Title */}
            <div className="flex-shrink-0">
              <h2 className="text-lg font-bold text-white">Our Partners</h2>
            </div>
            
            {/* Carousel Container with Gradient Fade */}
            <div className="relative flex-1 overflow-hidden">
              {/* Left Gradient Fade */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
              
              {/* Right Gradient Fade */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
              
              {/* Scrolling Logos */}
              <div 
                ref={carouselRef}
                className="flex items-center gap-8 overflow-x-hidden whitespace-nowrap"
                style={{ scrollBehavior: 'auto' }}
              >
                {/* First Set of Logos */}
                <div className="flex items-center gap-8 flex-shrink-0">
                  <div className="relative h-8 w-auto">
                    <Image
                      src="/images/ui/chrysler2022_white-1.png"
                      alt="Chrysler"
                      height={32}
                      width={80}
                      className="object-contain h-8 w-auto"
                    />
                  </div>
                  
                  <div className="relative h-8 w-auto">
                    <Image
                      src="/images/ui/Clorox-Logo-Grayscale-200-x-68-pixels-1-1.png"
                      alt="Clorox"
                      height={32}
                      width={80}
                      className="object-contain h-8 w-auto"
                    />
                  </div>
                  
                  <div className="relative h-8 w-auto">
                    <Image
                      src="/images/ui/first-bank-logo-e1645564484530.png"
                      alt="First Bank"
                      height={32}
                      width={80}
                      className="object-contain h-8 w-auto"
                    />
                  </div>
                  
                  <div className="relative h-8 w-auto">
                    <Image
                      src="/images/ui/ram2022.png"
                      alt="RAM"
                      height={32}
                      width={80}
                      className="object-contain h-8 w-auto"
                    />
                  </div>

                  <div className="relative h-8 w-auto">
                    <Image
                      src="/images/ui/DISCOVER PUERTO RICO DPR_logo_white.png"
                      alt="Discover Puerto Rico"
                      height={32}
                      width={80}
                      className="object-contain h-8 w-auto"
                    />
                  </div>
                </div>
                
                {/* Second Set of Logos for Seamless Loop */}
                <div className="flex items-center gap-8 flex-shrink-0">
                  <div className="relative h-8 w-auto">
                    <Image
                      src="/images/ui/chrysler2022_white-1.png"
                      alt="Chrysler"
                      height={32}
                      width={80}
                      className="object-contain h-8 w-auto"
                    />
                  </div>
                  
                  <div className="relative h-8 w-auto">
                    <Image
                      src="/images/ui/Clorox-Logo-Grayscale-200-x-68-pixels-1-1.png"
                      alt="Clorox"
                      height={32}
                      width={80}
                      className="object-contain h-8 w-auto"
                    />
                  </div>
                  
                  <div className="relative h-8 w-auto">
                    <Image
                      src="/images/ui/first-bank-logo-e1645564484530.png"
                      alt="First Bank"
                      height={32}
                      width={80}
                      className="object-contain h-8 w-auto"
                    />
                  </div>
                  
                  <div className="relative h-8 w-auto">
                    <Image
                      src="/images/ui/ram2022.png"
                      alt="RAM"
                      height={32}
                      width={80}
                      className="object-contain h-8 w-auto"
                    />
                  </div>

                  <div className="relative h-8 w-auto">
                    <Image
                      src="/images/ui/DISCOVER PUERTO RICO DPR_logo_white.png"
                      alt="Discover Puerto Rico"
                      height={32}
                      width={80}
                      className="object-contain h-8 w-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
