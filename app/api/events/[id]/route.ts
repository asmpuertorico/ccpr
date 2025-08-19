import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { getCurrentSession } from "@/lib/jwt";
import { validateCSRFFromRequest } from "@/lib/csrf-server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Always fetch fresh data and check both memory cache and DB
    await getStorage().listFresh(); // Ensure fresh data is loaded
    const item = await getStorage().get(params.id);
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
    const updated = await getStorage().update(params.id, updates);
    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
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

    const ok = await getStorage().delete(params.id);
    return NextResponse.json({ ok });
  } catch (error) {
    console.error('Event delete error:', error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}