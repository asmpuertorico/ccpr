import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getStorage } from "@/lib/storage";
import { getCachedEvent, EVENTS_TAG } from "@/lib/events-cache";
import { getCurrentSession } from "@/lib/jwt";
import { validateCSRFFromRequest } from "@/lib/csrf-server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Resolved from the tagged cache of the full list - no database round trip
    // per request, and admin writes invalidate it.
    const item = await getCachedEvent(params.id);
    if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(item, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Event fetch error:', error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!validateCSRFFromRequest(req)) {
      return NextResponse.json({ message: "Invalid CSRF token" }, { status: 403 });
    }

    const updates = await req.json();

    // update() persists the whole in-memory list back to Postgres, so pull the
    // current rows first - the read path no longer refreshes them for us.
    await getStorage().listFresh();

    const updated = await getStorage().update(params.id, updates);
    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
    revalidateTag(EVENTS_TAG);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!validateCSRFFromRequest(req)) {
      return NextResponse.json({ message: "Invalid CSRF token" }, { status: 403 });
    }

    // delete() persists the whole in-memory list back to Postgres, so pull the
    // current rows first - the read path no longer refreshes them for us.
    await getStorage().listFresh();

    const ok = await getStorage().delete(params.id);
    if (ok) revalidateTag(EVENTS_TAG);
    return NextResponse.json({ ok });
  } catch (error) {
    console.error('Event delete error:', error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}