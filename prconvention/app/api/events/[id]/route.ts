import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { getCurrentSession } from "@/lib/jwt";
import { validateCSRFFromRequest } from "@/lib/csrf-server";
import { validateEventData } from "@/lib/validation";
import { deleteImageFromBlob } from "@/lib/blob-storage";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storage = getStorage();
    const event = await storage.get(params.id);
    
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Event fetch error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json({
        message: "Validation failed",
        errors: validation.errors
      }, { status: 400 });
    }

    // Get existing event to check for image changes
    const storage = getStorage();
    const existingEvent = await storage.get(params.id);
    
    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Update event with sanitized data
    const updated = await storage.update(params.id, validation.sanitizedData);

    // Clean up old image if it was changed and was a blob URL
    if (existingEvent.image && 
        existingEvent.image !== validation.sanitizedData.image &&
        existingEvent.image.includes('blob.vercel-storage.com')) {
      
      console.log('Cleaning up old image:', existingEvent.image);
      await deleteImageFromBlob(existingEvent.image);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const storage = getStorage();
    
    // Get event before deletion to clean up image
    const event = await storage.get(params.id);
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Delete the event
    await storage.delete(params.id);

    // Clean up associated image if it's stored in Blob
    if (event.image && event.image.includes('blob.vercel-storage.com')) {
      console.log('Cleaning up event image:', event.image);
      const deleted = await deleteImageFromBlob(event.image);
      if (deleted) {
        console.log('Successfully cleaned up image for deleted event');
      }
    }

    return NextResponse.json({ 
      message: "Event deleted successfully",
      deletedImageCleanup: event.image ? true : false
    });
  } catch (error) {
    console.error('Event deletion error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

