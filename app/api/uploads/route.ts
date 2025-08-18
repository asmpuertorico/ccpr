import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { getCurrentSession } from "@/lib/jwt";
import { validateCSRFFromRequest } from "@/lib/csrf-server";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "events");

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

    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    // Generate filename
    const originalName = (file.name || "upload").replace(/[^a-zA-Z0-9_.-]/g, "_");
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).slice(2);
    const ext = optimize ? '.jpg' : (path.extname(originalName) || ".jpg");
    const name = `${timestamp}-${randomId}${ext}`;

    // Optimize image if requested
    if (optimize) {
      try {
        const sharpInstance = sharp(buffer);
        const metadata = await sharpInstance.metadata();
        
        // Calculate dimensions maintaining aspect ratio
        let finalWidth = targetWidth;
        let finalHeight = targetHeight;
        
        if (metadata.width && metadata.height) {
          const aspectRatio = metadata.width / metadata.height;
          const targetAspectRatio = targetWidth / targetHeight;
          
          if (aspectRatio > targetAspectRatio) {
            // Image is wider than target ratio
            finalHeight = Math.round(targetWidth / aspectRatio);
          } else {
            // Image is taller than target ratio
            finalWidth = Math.round(targetHeight * aspectRatio);
          }
        }

                const optimizedBuffer = await sharpInstance
          .resize(finalWidth, finalHeight, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({
            quality,
            progressive: true,
            mozjpeg: true
          })
          .toBuffer();
        
        buffer = Buffer.from(optimizedBuffer);

        console.log(`Image optimized: ${metadata.width}x${metadata.height} -> ${finalWidth}x${finalHeight}`);
      } catch (optimizationError) {
        console.warn('Image optimization failed, using original:', optimizationError);
        // Continue with original buffer if optimization fails
      }
    }

    let publicPath: string;
    let url: string;

    // Try Vercel Blob first (for production), fallback to local storage (for development)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`events/${name}`, buffer, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
          addRandomSuffix: true, // Ensure unique filenames for image uploads
        });
        url = blob.url;
        publicPath = blob.url;
      } catch (blobError) {
        console.warn('Blob upload failed, falling back to local storage:', blobError);
        
        // Fallback to local storage
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        const outPath = path.join(UPLOAD_DIR, name);
        await fs.writeFile(outPath, buffer);
        publicPath = `/images/events/${name}`;
        url = publicPath;
      }
    } else {
      // Local development - save to public folder
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      const outPath = path.join(UPLOAD_DIR, name);
      await fs.writeFile(outPath, buffer);
      publicPath = `/images/events/${name}`;
      url = publicPath;
    }
    
    return NextResponse.json({ 
      url: url,
      path: publicPath, // Keep for backward compatibility
      originalSize: file.size,
      optimizedSize: buffer.length,
      compressionRatio: ((file.size - buffer.length) / file.size * 100).toFixed(1) + '%'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      message: "Upload failed. Please try again." 
    }, { status: 500 });
  }
}



