import Link from "next/link";
import SafeEventImage from "@/components/SafeEventImage";
import { EventItem, formatEventDate, formatEventTime } from "@/lib/events";

export default function EventCard({ event, buyLabel, detailsLabel, locale }: { event: EventItem; buyLabel: string; detailsLabel: string; locale: string }) {
  const eventTime = formatEventTime(event);

  return (
    <div className="w-80 shrink-0 bg-white rounded-3xl overflow-hidden h-[460px] flex flex-col">
      {/* Event Image */}
      <div className="relative aspect-[4/3] m-4 rounded-2xl overflow-hidden flex-shrink-0">
        <SafeEventImage src={event.image} alt={event.name} fill sizes="(max-width: 768px) 80vw, 20rem" className="object-cover" />
      </div>
      
      {/* Content */}
      <div className="px-6 pb-6 flex flex-col flex-grow">
        {/* Event Title - Fixed height */}
        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight h-[3.5rem] flex items-start">
          {event.name}
        </h3>
        
        {/* Event Tags/Info - Fixed height */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-[2.5rem] content-start">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium h-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
              <line x1="16" y1="3" x2="16" y2="7" />
              <line x1="8" y1="3" x2="8" y2="7" />
              <line x1="3" y1="11" x2="21" y2="11" />
            </svg>
            {formatEventDate(event)}
          </span>
          {eventTime && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium h-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {eventTime}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium h-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {event.planner}
          </span>
        </div>
        
        {/* Action Buttons - Push to bottom */}
        <div className={`mt-auto ${event.ticketsUrl ? 'grid grid-cols-2 gap-3' : 'flex'}`}>
          {event.ticketsUrl && (
            <a 
              className="inline-flex items-center justify-center gap-1.5 bg-black text-white px-4 py-3 text-xs font-semibold rounded-full hover:bg-gray-800 transition-colors" 
              href={event.ticketsUrl} 
              target="_blank" 
              rel="noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4V7z" />
                <path d="M12 7v10" />
              </svg>
              {buyLabel}
            </a>
          )}
          <Link 
            className={`inline-flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-3 text-xs font-semibold rounded-full hover:bg-gray-200 transition-colors ${!event.ticketsUrl ? 'w-full' : ''}`}
            href={`/${locale}/events/${event.id}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            {detailsLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}