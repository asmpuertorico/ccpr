import { NextRequest, NextResponse } from "next/server";
import { getAllEventsWithFullData } from "@/lib/storage";
import { getEventDateTime, isPastEvent, formatEventDate, formatEventTime, formatEventDateRange } from "@/lib/events";

// Enhanced event type for LLM consumption
type LLMEvent = {
  // Core event information
  id: string;
  name: string;
  planner: string;
  description?: string;
  
  // Date and time information
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  endDate?: string; // YYYY-MM-DD (optional, for multi-day events)
  endTime?: string; // HH:MM (optional, for multi-day events)
  dateTime: string; // ISO 8601 format (start)
  endDateTime?: string; // ISO 8601 format (end, for multi-day events)
  formattedDate: string; // e.g., "Jan, 15"
  formattedTime: string; // e.g., "7:00 PM" or empty string
  formattedDateTime: string; // Combined formatted date and time (may include range)
  
  // Media and links
  imageUrl: string; // Full absolute URL
  ticketsUrl?: string;
  
  // Status and metadata
  status: string;
  isPast: boolean;
  
  // Audit information
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
};

function transformEventForLLM(
  event: Awaited<ReturnType<typeof getAllEventsWithFullData>>[0],
  baseUrl: string
): LLMEvent {
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
  
  // Convert image to absolute URL
  let imageUrl = event.image || '';
  if (imageUrl && !imageUrl.startsWith('http')) {
    if (imageUrl.startsWith('/')) {
      imageUrl = `${baseUrl}${imageUrl}`;
    } else {
      imageUrl = `${baseUrl}/${imageUrl}`;
    }
  }
  
  // Calculate end date/time for multi-day events
  const endDateTime = event.endDate ? (() => {
    const [year, month, day] = event.endDate.split("-").map((v) => parseInt(v, 10));
    const [hour, minute] = (event.endTime || "23:59").split(":").map((v) => parseInt(v, 10));
    return new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 23, minute ?? 59, 0, 0);
  })() : undefined;
  
  // Format date and time using the new date range formatter
  const formattedDateTime = formatEventDateRange(eventItem);
  
  // For backward compatibility, also provide separate formattedDate and formattedTime
  const formattedDate = formatEventDate(eventItem);
  const formattedTime = formatEventTime(eventItem);
  
  // Create ISO datetime string
  const dateTime = eventDateTime.toISOString();
  
  return {
    id: event.id,
    name: event.name,
    planner: event.planner,
    description: event.description,
    date: event.date,
    time: event.time || '',
    endDate: event.endDate,
    endTime: event.endTime,
    dateTime,
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
}

export async function GET(req: NextRequest) {
  try {
    // Get base URL for absolute URLs
    const baseUrl = req.nextUrl.origin || 
      process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    
    // Fetch all events with full data
    const events = await getAllEventsWithFullData();
    
    // Transform events for LLM consumption
    const llmEvents = events.map(event => transformEventForLLM(event, baseUrl));
    
    // Return structured response optimized for LLMs
    return NextResponse.json({
      metadata: {
        totalEvents: llmEvents.length,
        generatedAt: new Date().toISOString(),
        source: "Puerto Rico Convention Center Events",
        format: "LLM-optimized event data",
      },
      events: llmEvents,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes
        'Access-Control-Allow-Origin': '*', // Allow CORS for LLM access
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('LLM event data fetch error:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch event data",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

