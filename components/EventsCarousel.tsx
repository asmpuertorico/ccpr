"use client";
import React, { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";
import { EventItem, isPastEvent, sortByDateAsc } from "@/lib/events";

type Dict = { events: { empty: string; buyTickets: string; details: string } };

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
        {loading && (
          <div className="flex gap-4">
            {/* Skeleton loading states */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-80 shrink-0 bg-white rounded-3xl overflow-hidden h-[460px] animate-pulse">
                {/* Skeleton Image */}
                <div className="relative aspect-[4/3] m-4 rounded-2xl bg-gray-200"></div>
                
                {/* Skeleton Content */}
                <div className="px-6 pb-6 flex flex-col flex-grow">
                  {/* Skeleton Title */}
                  <div className="mb-4 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  
                  {/* Skeleton Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="h-7 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-7 bg-gray-200 rounded-full w-12"></div>
                    <div className="h-7 bg-gray-200 rounded-full w-20"></div>
                  </div>
                  
                  {/* Skeleton Buttons */}
                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <div className="h-10 bg-gray-200 rounded-full"></div>
                    <div className="h-10 bg-gray-200 rounded-full"></div>
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
            <EventCard event={e} buyLabel={dict.events.buyTickets} detailsLabel={dict.events.details} locale={locale} />
          </div>
        ))}
      </div>
    </div>
  );
}


