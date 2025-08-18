import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/jwt";
import { validateCSRFFromRequest } from "@/lib/csrf-server";
import { uploadImageToBlob } from "../../../lib/blob-storage";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

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

    const form = await req.formData();
    const file = form.get("file");
    const optimize = form.get("optimize") === "true";
    const targetWidth = parseInt(form.get("targetWidth") as string) || 1200;
    const targetHeight = parseInt(form.get("targetHeight") as string) || 900;
    const quality = parseInt(form.get("quality") as string) || 85;

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ 
        message: `File too large. Maximum size is ${MAX_BYTES / (1024 * 1024)}MB` 
      }, { status: 413 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        message: "Invalid file type. Please upload an image file." 
      }, { status: 400 });
    }

    // Upload to Vercel Blob with optimization
    const result = await uploadImageToBlob(file, file.name, {
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
      uploadedAt: result.uploadedAt
    });

  } catch (error) {
    console.error('Blob upload error:', error);
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : "Upload failed. Please try again." 
    }, { status: 500 });
  }
}

