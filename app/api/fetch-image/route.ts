import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/jwt";
import { validateCSRFFromRequest } from "@/lib/csrf-server";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB for remote images

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
    const { url } = body;
    
    if (!url || typeof url !== "string") {
      return NextResponse.json({ message: "Image URL is required" }, { status: 400 });
    }

    // Validate URL
    let imageUrl: URL;
    try {
      imageUrl = new URL(url);
    } catch {
      return NextResponse.json({ message: "Invalid URL format" }, { status: 400 });
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(imageUrl.protocol)) {
      return NextResponse.json({ message: "Only HTTP/HTTPS URLs are allowed" }, { status: 400 });
    }

    // Fetch the image
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Event Image Fetcher)',
        'Accept': 'image/*',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 seconds
    });

    if (!response.ok) {
      return NextResponse.json({ 
        message: `Failed to fetch image: ${response.status} ${response.statusText}` 
      }, { status: 400 });
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      return NextResponse.json({ 
        message: "URL does not point to an image file" 
      }, { status: 400 });
    }

    // Check content length
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BYTES) {
      return NextResponse.json({ 
        message: `Image too large. Maximum size is ${MAX_BYTES / (1024 * 1024)}MB` 
      }, { status: 413 });
    }

    // Get the image data
    const arrayBuffer = await response.arrayBuffer();
    
    // Double check the size
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ 
        message: `Image too large. Maximum size is ${MAX_BYTES / (1024 * 1024)}MB` 
      }, { status: 413 });
    }

    // Convert to base64 data URL for the frontend
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = contentType || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Extract filename from URL
    const pathname = imageUrl.pathname;
    const filename = pathname.split('/').pop() || 'image';
    const cleanFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');

    return NextResponse.json({
      dataUrl,
      filename: cleanFilename,
      size: arrayBuffer.byteLength,
      contentType: mimeType,
      originalUrl: url
    });

  } catch (error) {
    console.error('Image fetch error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json({ 
          message: "Image fetch timeout. Please try again." 
        }, { status: 408 });
      }
    }

    return NextResponse.json({ 
      message: "Failed to fetch image. Please try again." 
    }, { status: 500 });
  }
}
