import Link from "next/link";
import SafeEventImage from "@/components/SafeEventImage";
import { EventItem, formatEventDate, formatEventTime } from "@/lib/events";

export default function EventCard({ event, buyLabel, locale }: { event: EventItem; buyLabel: string; locale: string }) {
  return (
    <div className="w-72 shrink-0 bg-white rounded-lg shadow border border-ink/10 overflow-hidden">
      <div className="relative aspect-[4/3]">
        <SafeEventImage src={event.image} alt={event.name} fill sizes="(max-width: 768px) 80vw, 18rem" className="object-cover" />
        {/* Date badge */}
        <div className="absolute top-2 left-2 inline-flex items-center rounded-full bg-black/70 text-white px-2 py-0.5 text-[11px] font-semibold ring-1 ring-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-1">
            <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
            <line x1="16" y1="3" x2="16" y2="7" />
            <line x1="8" y1="3" x2="8" y2="7" />
            <line x1="3" y1="11" x2="21" y2="11" />
          </svg>
          {formatEventDate(event)}
        </div>
      </div>
      <div className="p-4 flex flex-col h-48">
        <h3 className="font-semibold text-ink line-clamp-2 min-h-[3.25rem]">{event.name}</h3>
        <p className="text-sm text-ink/70 mt-1 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
            <line x1="16" y1="3" x2="16" y2="7" />
            <line x1="8" y1="3" x2="8" y2="7" />
            <line x1="3" y1="11" x2="21" y2="11" />
          </svg>
          <span>
            {formatEventDate(event)}
            {formatEventTime(event) ? ` · ${formatEventTime(event)}` : ""}
          </span>
        </p>
        <p className="text-sm text-ink/70 line-clamp-1 mt-1 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
          </svg>
          <span>{event.planner}</span>
        </p>
        <div className="mt-auto pt-2 flex items-center gap-2">
          {event.ticketsUrl && (
            <a className="inline-flex items-center rounded-md bg-gradient-to-r from-[#f78f1e] to-[#10a0c6] text-white px-3 py-1.5 text-sm hover:opacity-90" href={event.ticketsUrl} target="_blank" rel="noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-1.5">
                <path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4V7z" />
                <path d="M12 7v10" />
              </svg>
              {buyLabel}
            </a>
          )}
          <Link className="text-sm text-ocean hover:underline" href={`/${locale}/events/${event.id}`}>Details</Link>
        </div>
      </div>
    </div>
  );
}



