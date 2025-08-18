"use client";
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, RotateCw, Crop, Check, ZoomIn, ZoomOut } from "lucide-react";

interface PhotoEditorProps {
  image: string; // URL or data URL of the image to edit
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedImageBlob: Blob, preview: string) => void;
  title?: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function PhotoEditor({
  image,
  isOpen,
  onClose,
  onSave,
  title = "Crop Image"
}: PhotoEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => {
        console.error('Image loading failed:', error);
        reject(error);
      });
      
      // Only set crossOrigin for HTTP URLs, not data URLs
      if (url.startsWith('http')) {
        image.setAttribute('crossOrigin', 'anonymous');
      }
      
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea,
    rotation = 0
  ): Promise<{ blob: Blob; url: string }> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Calculate the size after rotation
    const rotRad = rotation * (Math.PI / 180);
    const sin = Math.abs(Math.sin(rotRad));
    const cos = Math.abs(Math.cos(rotRad));
    const rotatedWidth = image.width * cos + image.height * sin;
    const rotatedHeight = image.width * sin + image.height * cos;

    // Set canvas to rotated size
    const canvasWidth = Math.max(rotatedWidth, image.width);
    const canvasHeight = Math.max(rotatedHeight, image.height);
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Move to center of canvas
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    
    // Rotate
    ctx.rotate(rotRad);
    
    // Draw image from center
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    // Get the cropped portion
    const imageData = ctx.getImageData(
      pixelCrop.x - (canvasWidth - image.width) / 2,
      pixelCrop.y - (canvasHeight - image.height) / 2,
      pixelCrop.width,
      pixelCrop.height
    );

    // Reset canvas to crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    
    // Clear and draw the cropped data
    ctx.clearRect(0, 0, pixelCrop.width, pixelCrop.height);
    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({ blob, url });
      }, 'image/jpeg', 0.9);
    });
  };

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;

    setProcessing(true);
    try {
      const { blob, url } = await getCroppedImg(image, croppedAreaPixels, rotation);
      
      // Validate the blob
      if (!blob || blob.size === 0) {
        throw new Error('Generated image is empty');
      }
      
      onSave(blob, url);
    } catch (error) {
      console.error('Error cropping image:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to crop image. Please try again.';
      alert(errorMessage);
    } finally {
      setProcessing(false);
    }
  }, [croppedAreaPixels, image, rotation, onSave]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Crop your image to 4:3 aspect ratio for optimal display
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="flex-1 relative bg-gray-900 min-h-[400px]">
          <Cropper
            image={image}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            aspect={4 / 3} // 4:3 aspect ratio for event cards
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropShape="rect"
            showGrid={true}
            objectFit="contain"
          />
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-gray-200">
          {/* Zoom Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ZoomIn className="inline h-4 w-4 mr-1" />
              Zoom
            </label>
            <div className="flex items-center gap-3">
              <ZoomOut className="h-4 w-4 text-gray-400" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <ZoomIn className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>

          {/* Rotation Control */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <RotateCw className="inline h-4 w-4 mr-1" />
              Rotation
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                value={rotation}
                min={-180}
                max={180}
                step={1}
                aria-labelledby="Rotation"
                onChange={(e) => setRotation(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-gray-600 w-12 text-right">
                {rotation}°
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <Crop className="inline h-4 w-4 mr-1" />
              Target size: 1200×900px (4:3 ratio)
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={processing}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={processing || !croppedAreaPixels}
                className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Crop & Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
