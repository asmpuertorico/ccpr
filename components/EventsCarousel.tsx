"use client";
import React, { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";
import { EventItem, isPastEvent, sortByDateAsc } from "@/lib/events";

type Dict = { events: { empty: string; buyTickets: string; details: string } };

export default function EventsCarousel({
  locale,
  dict,
  initialEvents,
}: {
  locale: string;
  dict: Dict;
  initialEvents: EventItem[];
}) {
  // Rendered from server data, so there is no loading state and no polling.
  // The server hands us a slight superset of upcoming events (it filters with a
  // grace window because it runs in UTC), and we trim it below to the visitor's
  // own clock once we're on the client.
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const listRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    setEvents(initialEvents.filter((e) => !isPastEvent(e, now)).sort(sortByDateAsc));
  }, [initialEvents]);

  return (
    <div className="relative">
      {/* Desktop navigation arrows - positioned outside the content area */}
      <button
        type="button"
        aria-label="Previous"
        onClick={() => { listRef.current?.scrollBy({ left: -300, behavior: "smooth" }); }}
        className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors border border-white/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => { listRef.current?.scrollBy({ left: 300, behavior: "smooth" }); }}
        className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors border border-white/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div ref={listRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2" role="list">
        {events.length === 0 && (
          <p className="text-sm text-ink/70">{dict.events.empty}</p>
        )}
        
        {events.map((e) => (
          <div key={e.id} className="snap-start">
            <EventCard event={e} buyLabel={dict.events.buyTickets} detailsLabel={dict.events.details} locale={locale} />
          </div>
        ))}
      </div>
    </div>
  );
}


