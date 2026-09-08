import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getStorage } from "@/lib/storage";
import { getCachedEvents, EVENTS_TAG } from "@/lib/events-cache";
import { isEventItem } from "@/lib/events";
import { getCurrentSession } from "@/lib/jwt";
import { validateCSRFFromRequest } from "@/lib/csrf-server";
import { validateEventData } from "@/lib/validation";

export async function GET() {
  // Served from the tagged data cache, so this costs a database round trip only
  // after an admin write or the cache expiry - not once per request.
  const events = await getCachedEvents();
  return NextResponse.json({ 
    events,
    timestamp: Date.now() // Add timestamp to help with cache busting
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check CSRF protection
    if (!validateCSRFFromRequest(req)) {
      return NextResponse.json({ message: "Invalid CSRF token" }, { status: 403 });
    }

    const body = await req.json();
    
    // Validate and sanitize input
    const validation = validateEventData(body);
    
    if (!validation.isValid) {
      console.error('Event validation failed:', validation.errors);
      return NextResponse.json({ 
        message: "Validation failed", 
        errors: validation.errors 
      }, { status: 400 });
    }

    // create() persists the whole in-memory list back to Postgres, so pull the
    // current rows first - the read path no longer refreshes them for us.
    await getStorage().listFresh();

    // Create event with sanitized data
    const created = await getStorage().create(validation.sanitizedData);
    revalidateTag(EVENTS_TAG);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Replace all events with provided array (admin only)
export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check CSRF protection
    if (!validateCSRFFromRequest(req)) {
      return NextResponse.json({ message: "Invalid CSRF token" }, { status: 403 });
    }

    const body = await req.json();
    const events = Array.isArray(body?.events) ? body.events : [];
    
    // Validate each event in the array
    const validatedEvents = [];
    const validationErrors = [];
    
    for (let i = 0; i < events.length; i++) {
      const validation = validateEventData(events[i]);
      if (validation.isValid) {
        validatedEvents.push(validation.sanitizedData);
      } else {
        validationErrors.push({
          index: i,
          errors: validation.errors
        });
      }
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json({
        message: "Some events failed validation",
        validationErrors
      }, { status: 400 });
    }
    
    await getStorage().replaceAll(validatedEvents);
    revalidateTag(EVENTS_TAG);
    return NextResponse.json({ ok: true, count: validatedEvents.length });
  } catch (error) {
    console.error('Bulk event update error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


