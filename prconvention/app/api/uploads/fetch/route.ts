import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/jwt";
import { validateCSRFFromRequest } from "@/lib/csrf-server";
import { uploadImageFromUrl } from "@/lib/blob-storage";

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
    const { url, optimize = true, targetWidth = 1200, targetHeight = 900, quality = 85 } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ message: "URL is required" }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ message: "Invalid URL format" }, { status: 400 });
    }

    // Check if URL points to an image
    if (!url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
      return NextResponse.json({ 
        message: "URL must point to an image file (jpg, png, gif, webp)" 
      }, { status: 400 });
    }

    // Import image from URL and upload to Blob
    const result = await uploadImageFromUrl(url, {
      optimize,
      targetWidth,
      targetHeight,
      quality
    });
    
    return NextResponse.json({ 
      path: result.url, // Return the full Blob URL
      url: result.url,  // Also provide as 'url' for compatibility
      pathname: result.pathname,
      originalSize: result.originalSize,
      optimizedSize: result.size,
      compressionRatio: result.compressionRatio,
      uploadedAt: result.uploadedAt,
      sourceUrl: url
    });

  } catch (error) {
    console.error('URL import error:', error);
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : "Failed to import image from URL" 
    }, { status: 500 });
  }
}

