import { en } from "@/lib/i18n/dictionaries/en";
import { es } from "@/lib/i18n/dictionaries/es";
import { supportedLocales, type SupportedLocale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { getAllEventsWithFullData } from "@/lib/storage";
import { getEventDateTime, isPastEvent, formatEventDate, formatEventTime, formatEventDateRange } from "@/lib/events";

type LLMEvent = {
  id: string;
  name: string;
  planner: string;
  description?: string;
  date: string;
  time: string;
  endDate?: string;
  endTime?: string;
  dateTime: string;
  endDateTime?: string;
  formattedDate: string;
  formattedTime: string;
  formattedDateTime: string;
  imageUrl: string;
  ticketsUrl?: string;
  status: string;
  isPast: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
};

async function getLLMEvents(baseUrl: string): Promise<LLMEvent[]> {
  const events = await getAllEventsWithFullData();
  
  return events.map(event => {
    const eventItem = {
      id: event.id,
      name: event.name,
      date: event.date,
      time: event.time,
      endDate: event.endDate,
      endTime: event.endTime,
      planner: event.planner,
      image: event.image,
      ticketsUrl: event.ticketsUrl,
      description: event.description,
    };
    
    const eventDateTime = getEventDateTime(eventItem);
    const endDateTime = event.endDate ? (() => {
      const [year, month, day] = event.endDate.split("-").map((v) => parseInt(v, 10));
      const [hour, minute] = (event.endTime || "23:59").split(":").map((v) => parseInt(v, 10));
      return new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 23, minute ?? 59, 0, 0);
    })() : undefined;
    
    let imageUrl = event.image || '';
    if (imageUrl && !imageUrl.startsWith('http')) {
      if (imageUrl.startsWith('/')) {
        imageUrl = `${baseUrl}${imageUrl}`;
      } else {
        imageUrl = `${baseUrl}/${imageUrl}`;
      }
    }
    
    // Use the new date range formatter
    const formattedDateTime = formatEventDateRange(eventItem);
    
    // For backward compatibility, also provide separate formattedDate and formattedTime
    const formattedDate = formatEventDate(eventItem);
    const formattedTime = formatEventTime(eventItem);
    
    return {
      id: event.id,
      name: event.name,
      planner: event.planner,
      description: event.description,
      date: event.date,
      time: event.time || '',
      endDate: event.endDate,
      endTime: event.endTime,
      dateTime: eventDateTime.toISOString(),
      endDateTime: endDateTime?.toISOString(),
      formattedDate,
      formattedTime,
      formattedDateTime,
      imageUrl,
      ticketsUrl: event.ticketsUrl,
      status: event.status,
      isPast: isPastEvent(eventItem),
      createdAt: typeof event.createdAt === 'string' ? event.createdAt : new Date(event.createdAt).toISOString(),
      updatedAt: typeof event.updatedAt === 'string' ? event.updatedAt : new Date(event.updatedAt).toISOString(),
      createdBy: event.createdBy,
      updatedBy: event.updatedBy,
      version: event.version,
    };
  });
}

function generateJSONLD(events: LLMEvent[], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Puerto Rico Convention Center Events",
    "description": "List of upcoming and past events at the Puerto Rico Convention Center",
    "numberOfItems": events.length,
    "itemListElement": events.map((event, index) => {
      return {
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Event",
          "@id": `${baseUrl}/events/${event.id}`,
          "name": event.name,
          "description": event.description || "",
          "startDate": event.dateTime,
          ...(event.endDateTime && { "endDate": event.endDateTime }),
          "organizer": {
            "@type": "Organization",
            "name": event.planner,
          },
          "image": event.imageUrl,
          ...(event.ticketsUrl && {
            "offers": {
              "@type": "Offer",
              "url": event.ticketsUrl,
              "availability": "https://schema.org/InStock",
            },
          }),
        },
      };
    }),
  };
}

export default async function LLMEventsPage({ 
  params 
}: { 
  params: { locale: string } 
}) {
  const locale = params.locale as SupportedLocale;
  if (!supportedLocales.includes(locale)) notFound();
  const dict = locale === "es" ? es : en;
  
  // Get base URL from headers or environment
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (host ? `${protocol}://${host}` : 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"));
  
  const events = await getLLMEvents(baseUrl);
  const jsonLd = generateJSONLD(events, baseUrl);
  
  return (
    <>
      <Navbar locale={locale} dict={dict} />
      <main className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <Container>
          <div className="py-12">
            <h1 className="text-4xl font-bold mb-4">Event Data for LLMs</h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
              This page provides structured event data optimized for Large Language Models (LLMs) and AI systems.
            </p>
            
            <div className="mb-8 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">API Endpoint</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                Access the machine-readable JSON data via:
              </p>
              <code className="block p-2 bg-white dark:bg-neutral-900 rounded text-sm break-all">
                {baseUrl}/api/events/llm
              </code>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Events ({events.length})</h2>
              <div className="space-y-6">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {event.imageUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={event.imageUrl}
                            alt={event.name}
                            className="w-full md:w-48 h-32 object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                        <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                          <p><strong>Planner:</strong> {event.planner}</p>
                          <p><strong>Date:</strong> {event.formattedDateTime}</p>
                          <p><strong>ISO DateTime:</strong> {event.dateTime}</p>
                          <p><strong>Status:</strong> {event.status}</p>
                          <p><strong>Is Past Event:</strong> {event.isPast ? "Yes" : "No"}</p>
                          {event.description && (
                            <p><strong>Description:</strong> {event.description}</p>
                          )}
                          {event.ticketsUrl && (
                            <p>
                              <strong>Tickets:</strong>{" "}
                              <a
                                href={event.ticketsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {event.ticketsUrl}
                              </a>
                            </p>
                          )}
                          <p><strong>Event ID:</strong> {event.id}</p>
                          <p><strong>Created:</strong> {new Date(event.createdAt).toLocaleString()}</p>
                          <p><strong>Updated:</strong> {new Date(event.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Structured Data (JSON-LD)</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                The following JSON-LD structured data is embedded in this page for search engines and LLMs:
              </p>
              <pre className="bg-white dark:bg-neutral-900 p-4 rounded text-xs overflow-x-auto">
                {JSON.stringify(jsonLd, null, 2)}
              </pre>
            </div>
          </div>
        </Container>
      </main>
      <Footer locale={locale} dict={dict} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

