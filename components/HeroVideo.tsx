"use client";

import React from "react";
import Container from "@/components/Container";
import { FlipWords } from "@/components/ui/flip-words";

export default function HeroVideo() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {/* Hide motion for users preferring reduced motion */}
        <video
          className="w-full h-full object-cover motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/hero/poster.jpg"
        >
          <source src="/videos/hero/hero.webm" type="video/webm" />
          {/* Prefer the official MP4 first */}
          <source src="/videos/hero/PRCONVENTION-HERO.mp4" type="video/mp4" />
          {/* Fallback MP4 name */}
          <source src="/videos/hero/hero.mp4" type="video/mp4" />
        </video>
        {/* Poster fallback when motion is reduced */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/videos/hero/poster.jpg" alt="" className="w-full h-full object-cover hidden motion-reduce:block" />
      </div>
      {/* Stronger gradient overlay from black (bottom) to transparent (top) */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0">
        <Container className="h-full flex flex-col items-center justify-end text-center gap-4 pb-16 md:pb-24">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href="https://www.metro.pr/noticias/2024/10/01/centro-de-convenciones-de-puerto-rico-recibe-premio-a-nivel-internacional/#google_vignette"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20 hover:bg-white/15"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M17 3h4a1 1 0 0 1 1 1v2a5 5 0 0 1-5 5h-.28A7 7 0 0 1 13 13.72V17h3a1 1 0 0 1 0 2h-3v2h4a1 1 0 0 1 0 2H7a1 1 0 1 1 0-2h4v-2H8a1 1 0 0 1 0-2h3v-3.28A7 7 0 0 1 7.28 11H7A5 5 0 0 1 2 6V4a1 1 0 0 1 1-1h4V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1Zm-2 0H9v1a1 1 0 0 1-1 1H4v1a3 3 0 0 0 3 3h.28a7 7 0 0 1 9.44 0H17a3 3 0 0 0 3-3V5h-4a1 1 0 0 1-1-1V3Z"/>
              </svg>
              <span>Stella Award Winners</span>
              <span aria-hidden className="ml-1">→</span>
            </a>
          </div>
          <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-medium max-w-4xl leading-[1.1] md:leading-tight">
            <span>Your </span>
            <FlipWords
              words={[
                "sports event",
                "graduation",
                "meeting",
                "conference",
                "convention",
                "concert",
              ]}
              className="font-medium text-[#90d8f8]"
            />
            <br />
            <span>deserves the best venue</span>
          </h1>
          <div className="mt-4 flex gap-3">
            <a onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event("open-chat-modal")); }} href="#" className="inline-flex items-center rounded-full bg-white text-ink px-6 py-2 text-sm font-medium hover:bg-white/90">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-2">
                <path d="M21 15a4 4 0 0 1-4 4H9l-5 4v-6a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h13a4 4 0 0 1 4 4v8z" />
              </svg>
              Let&apos;s Chat
            </a>
            <a href="#events" className="inline-flex items-center rounded-full bg-black text-white px-6 py-2 text-sm font-medium hover:bg-black/90">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-2">
                <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
                <line x1="16" y1="3" x2="16" y2="7" />
                <line x1="8" y1="3" x2="8" y2="7" />
                <line x1="3" y1="11" x2="21" y2="11" />
              </svg>
              Next Events
            </a>
          </div>
        </Container>
      </div>
      {/* Animated gradient border anchored to the very bottom of the hero */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div
          className="animated-gradient-border"
          style={{ backgroundImage: "linear-gradient(90deg, #f78f1e, #90d8f8, #0e7bbd, #10a0c6)" }}
        />
      </div>
    </section>
  );
}


