import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/jwt";
import { validateCSRFFromRequest } from "@/lib/csrf-server";
import { cleanupOrphanedImages } from "@/lib/blob-storage";
import { getStorage } from "@/lib/storage";

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

    // Get all current events to determine which images are still in use
    const storage = getStorage();
    const events = await storage.list();
    
    // Extract all image URLs that are currently referenced
    const referencedUrls = events
      .map(event => event.image)
      .filter(Boolean) // Remove empty/null images
      .filter(url => url.includes('blob.vercel-storage.com')); // Only Blob URLs

    console.log(`Found ${referencedUrls.length} referenced images in ${events.length} events`);

    // Cleanup orphaned images
    const deletedCount = await cleanupOrphanedImages(referencedUrls);

    return NextResponse.json({
      message: "Image cleanup completed",
      totalEvents: events.length,
      referencedImages: referencedUrls.length,
      deletedImages: deletedCount,
      details: {
        referencedUrls: referencedUrls.slice(0, 10) // Show first 10 for debugging
      }
    });
  } catch (error) {
    console.error('Image cleanup error:', error);
    return NextResponse.json(
      { message: "Cleanup failed", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

