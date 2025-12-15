import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  // Get base URL
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (host ? `${protocol}://${host}` : 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"));

  const llmTxt = `# LLM.txt for Puerto Rico Convention Center

## About
Puerto Rico Convention Center (PRCC) is a premier event venue in San Juan, Puerto Rico. This file helps LLMs discover and access structured event data.

## Events Data
We provide structured event data optimized for LLMs and AI systems:

### API Endpoints
- Events API (JSON): ${baseUrl}/api/events/llm
- Events Page (HTML + JSON-LD): ${baseUrl}/en/events/llm

### Data Format
- Events are provided in JSON format with full metadata
- Includes: event name, dates, times, descriptions, images, ticket URLs
- Supports multi-day events with start and end dates/times
- Events are marked as past/upcoming automatically
- Data is updated in real-time

### Event Fields
- id: Unique event identifier
- name: Event name
- planner: Event organizer/planner
- date: Start date (YYYY-MM-DD)
- time: Start time (HH:MM, optional)
- endDate: End date for multi-day events (optional)
- endTime: End time for multi-day events (optional)
- description: Event description
- imageUrl: Full URL to event image
- ticketsUrl: Link to purchase tickets (optional)
- formattedDateTime: Human-readable date/time string
- isPast: Boolean indicating if event has passed

## Website
- Main site: ${baseUrl}
- Events listing: ${baseUrl}/en/events

## Contact
- Email: info@prconvention.com
- Phone: (787) 641-7722

## Last Updated
${new Date().toISOString()}
`;

  return new NextResponse(llmTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
    },
  });
}

