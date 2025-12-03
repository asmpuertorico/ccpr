import { NextRequest, NextResponse } from "next/server";
import { getAllEventsWithFullData } from "@/lib/storage";
import { getEventDateTime, isPastEvent, formatEventDate, formatEventTime } from "@/lib/events";

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
  dateTime: string; // ISO 8601 format
  formattedDate: string; // e.g., "Jan, 15"
  formattedTime: string; // e.g., "7:00 PM" or empty string
  formattedDateTime: string; // Combined formatted date and time
  
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
  const eventDateTime = getEventDateTime({
    id: event.id,
    name: event.name,
    date: event.date,
    time: event.time,
    planner: event.planner,
    image: event.image,
    ticketsUrl: event.ticketsUrl,
    description: event.description,
  });
  
  // Convert image to absolute URL
  let imageUrl = event.image || '';
  if (imageUrl && !imageUrl.startsWith('http')) {
    if (imageUrl.startsWith('/')) {
      imageUrl = `${baseUrl}${imageUrl}`;
    } else {
      imageUrl = `${baseUrl}/${imageUrl}`;
    }
  }
  
  // Format date and time
  const formattedDate = formatEventDate({
    id: event.id,
    name: event.name,
    date: event.date,
    time: event.time,
    planner: event.planner,
    image: event.image,
    ticketsUrl: event.ticketsUrl,
    description: event.description,
  });
  
  const formattedTime = formatEventTime({
    id: event.id,
    name: event.name,
    date: event.date,
    time: event.time,
    planner: event.planner,
    image: event.image,
    ticketsUrl: event.ticketsUrl,
    description: event.description,
  });
  
  const formattedDateTime = formattedTime 
    ? `${formattedDate} at ${formattedTime}`
    : formattedDate;
  
  // Create ISO datetime string
  const dateTime = eventDateTime.toISOString();
  
  return {
    id: event.id,
    name: event.name,
    planner: event.planner,
    description: event.description,
    date: event.date,
    time: event.time,
    dateTime,
    formattedDate,
    formattedTime,
    formattedDateTime,
    imageUrl,
    ticketsUrl: event.ticketsUrl,
    status: event.status,
    isPast: isPastEvent({
      id: event.id,
      name: event.name,
      date: event.date,
      time: event.time,
      planner: event.planner,
      image: event.image,
      ticketsUrl: event.ticketsUrl,
      description: event.description,
    }),
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

