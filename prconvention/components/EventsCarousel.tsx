"use client";
import React, { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";
import { EventItem, isPastEvent, sortByDateAsc } from "@/lib/events";

type Dict = { events: { empty: string; buyTickets: string } };

export default function EventsCarousel({ locale, dict }: { locale: string; dict: Dict }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const listRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    let mounted = true;
    fetch("/api/events")
      .then((r) => r.json())
      .then((data: { events: EventItem[] }) => {
        if (!mounted) return;
        const now = new Date();
        const future = (data?.events ?? [])
          .filter((e) => !isPastEvent(e, now))
          .sort(sortByDateAsc);
        setEvents(future);
      })
      .catch(() => setEvents([]));
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div className="relative">
      {/* Desktop navigation arrows */}
      <button
        type="button"
        aria-label="Previous"
        onClick={() => { listRef.current?.scrollBy({ left: -300, behavior: "smooth" }); }}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => { listRef.current?.scrollBy({ left: 300, behavior: "smooth" }); }}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div ref={listRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2" role="list">
        {events.length === 0 && (
          <p className="text-sm text-ink/70">{dict.events.empty}</p>
        )}
        {events.map((e) => (
          <div key={e.id} className="snap-start">
            <EventCard event={e} buyLabel={dict.events.buyTickets} locale={locale} />
          </div>
        ))}
      </div>
    </div>
  );
}


