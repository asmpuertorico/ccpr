"use client";
import React, { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";
import { EventItem, isPastEvent, sortByDateAsc } from "@/lib/events";

type Dict = { events: { empty: string; buyTickets: string } };

export default function EventsCarousel({ locale, dict }: { locale: string; dict: Dict }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      // Add cache busting to ensure fresh data
      const response = await fetch(`/api/events?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data: { events: EventItem[] } = await response.json();
      const now = new Date();
      const future = (data?.events ?? [])
        .filter((e) => !isPastEvent(e, now))
        .sort(sortByDateAsc);
      setEvents(future);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Set up periodic refresh every 30 seconds to catch admin updates
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
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
        {loading && (
          <div className="flex gap-4">
            {/* Skeleton loading states */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-72 shrink-0">
                <div className="bg-white rounded-lg shadow border border-ink/10 overflow-hidden animate-pulse">
                  <div className="relative aspect-[4/3] bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="flex gap-2 pt-2">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {error && !loading && (
          <div className="w-full text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchEvents}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              Try Again
            </button>
          </div>
        )}
        
        {!loading && !error && events.length === 0 && (
          <p className="text-sm text-ink/70">{dict.events.empty}</p>
        )}
        
        {!loading && !error && events.map((e) => (
          <div key={e.id} className="snap-start">
            <EventCard event={e} buyLabel={dict.events.buyTickets} locale={locale} />
          </div>
        ))}
      </div>
    </div>
  );
}


