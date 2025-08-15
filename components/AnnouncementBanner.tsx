"use client";
import React from "react";

export default function AnnouncementBanner() {
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    const v = typeof window !== "undefined" ? window.localStorage.getItem("prcc_banner50_hidden") : null;
    if (v === "1") setHidden(true);
  }, []);

  if (hidden) return null;

  return (
    <div className="relative z-[60] isolate flex items-center justify-center gap-x-6 overflow-hidden bg-ink px-4 py-1.5 sm:py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10 sm:px-4 min-h-[36px]">
      <div aria-hidden className="absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl">
        <div
          className="w-[600px] aspect-[577/310] opacity-30 bg-gradient-to-r from-sun to-sky"
          style={{ clipPath: "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)" }}
        />
      </div>
      <div aria-hidden className="absolute top-1/2 left-[max(45rem,calc(50%+8rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl">
        <div
          className="w-[600px] aspect-[577/310] opacity-30 bg-gradient-to-r from-teal to-ocean"
          style={{ clipPath: "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)" }}
        />
      </div>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
        <p className="text-xs md:text-sm text-white">
          <strong className="font-semibold">Celebrating 20 Years of Excellence</strong>
          <svg viewBox="0 0 2 2" aria-hidden="true" className="mx-2 inline size-0.5 fill-current"><circle r="1" cx="1" cy="1" /></svg>
          Winner of the Stella Awards
        </p>
        <a
          href="https://www.metro.pr/noticias/2024/10/01/centro-de-convenciones-de-puerto-rico-recibe-premio-a-nivel-internacional/#google_vignette"
          target="_blank"
          rel="noreferrer"
          className="flex-none rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs ring-1 ring-white/20 hover:bg-white/15"
        >
          Read More <span aria-hidden>→</span>
        </a>
      </div>
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 focus-visible:-outline-offset-4"
        aria-label="Dismiss"
        onClick={() => {
          setHidden(true);
          try { window.localStorage.setItem("prcc_banner50_hidden", "1"); } catch {}
        }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-4 text-white opacity-80"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
      </button>
    </div>
  );
}


