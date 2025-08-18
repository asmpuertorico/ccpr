import { put, del, list } from '@vercel/blob';
import sharp from 'sharp';

export interface BlobUploadResult {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
  originalSize?: number;
  compressionRatio?: string;
}

export interface BlobUploadOptions {
  optimize?: boolean;
  targetWidth?: number;
  targetHeight?: number;
  quality?: number;
}

/**
 * Upload image to Vercel Blob with optimization
 */
export async function uploadImageToBlob(
  file: File | Buffer,
  filename: string,
  options: BlobUploadOptions = {}
): Promise<BlobUploadResult> {
  const {
    optimize = true,
    targetWidth = 1200,
    targetHeight = 900,
    quality = 85
  } = options;

  let buffer: Buffer;
  let originalSize: number;

  // Convert File to Buffer if needed
  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    originalSize = file.size;
  } else {
    buffer = file;
    originalSize = buffer.length;
  }

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
          finalHeight = Math.round(targetWidth / aspectRatio);
        } else {
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
    } catch (error) {
      console.warn('Image optimization failed, using original:', error);
    }
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).slice(2);
  const extension = optimize ? '.jpg' : getFileExtension(filename);
  const blobFilename = `events/${timestamp}-${randomId}${extension}`;

  try {
    // Upload to Vercel Blob
    const blob = await put(blobFilename, buffer, {
      access: 'public',
      contentType: optimize ? 'image/jpeg' : getContentType(filename),
      addRandomSuffix: true, // Ensure unique filenames to avoid conflicts
    });

    const compressionRatio = originalSize > 0 
      ? ((originalSize - buffer.length) / originalSize * 100).toFixed(1) + '%'
      : '0%';

    return {
      url: blob.url,
      pathname: blob.pathname,
      size: buffer.length,
      uploadedAt: new Date(),
      originalSize,
      compressionRatio
    };
  } catch (error) {
    console.error('Blob upload failed:', error);
    throw new Error('Failed to upload image to cloud storage');
  }
}

/**
 * Upload image from URL to Vercel Blob
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  options: BlobUploadOptions = {}
): Promise<BlobUploadResult> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = getFilenameFromUrl(imageUrl) || 'imported-image.jpg';

    return await uploadImageToBlob(buffer, filename, options);
  } catch (error) {
    console.error('URL import failed:', error);
    throw new Error('Failed to import image from URL');
  }
}

/**
 * Delete image from Vercel Blob
 */
export async function deleteImageFromBlob(urlOrPathname: string): Promise<boolean> {
  try {
    // Extract pathname from full URL if needed
    let pathname = urlOrPathname;
    if (urlOrPathname.startsWith('https://')) {
      const url = new URL(urlOrPathname);
      pathname = url.pathname;
      // Remove leading slash
      pathname = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    }

    await del(pathname);
    console.log(`Successfully deleted image: ${pathname}`);
    return true;
  } catch (error) {
    console.error('Failed to delete image from blob:', error);
    return false;
  }
}

/**
 * List all images in blob storage (for cleanup/management)
 */
export async function listBlobImages(): Promise<Array<{url: string, pathname: string, size: number, uploadedAt: Date}>> {
  try {
    const { blobs } = await list({
      prefix: 'events/',
      limit: 1000
    });

    return blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt
    }));
  } catch (error) {
    console.error('Failed to list blob images:', error);
    return [];
  }
}

/**
 * Cleanup orphaned images (images not referenced by any events)
 */
export async function cleanupOrphanedImages(referencedUrls: string[]): Promise<number> {
  try {
    const allImages = await listBlobImages();
    let deletedCount = 0;

    for (const image of allImages) {
      const isReferenced = referencedUrls.some(url => 
        url === image.url || url.includes(image.pathname)
      );

      if (!isReferenced) {
        const deleted = await deleteImageFromBlob(image.pathname);
        if (deleted) {
          deletedCount++;
        }
      }
    }

    console.log(`Cleanup completed: ${deletedCount} orphaned images deleted`);
    return deletedCount;
  } catch (error) {
    console.error('Cleanup failed:', error);
    return 0;
  }
}

// Helper functions
function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? `.${ext}` : '.jpg';
}

function getContentType(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'image/jpeg';
}

function getFilenameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    return filename || null;
  } catch {
    return null;
  }
}

