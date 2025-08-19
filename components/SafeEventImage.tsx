"use client";

import Image from "next/image";
import { useState } from "react";

interface SafeEventImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function SafeEventImage({ 
  src, 
  alt, 
  fill, 
  className, 
  sizes,
  priority = false 
}: SafeEventImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use placeholder for broken images or local paths that don't exist
  const shouldUsePlaceholder = imageError || src.startsWith('/images/events/');
  const placeholderSrc = "/images/ui/placeholder-event.svg";

  const handleError = () => {
    setImageError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (shouldUsePlaceholder) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        {fill ? (
          <Image
            src={placeholderSrc}
            alt={alt}
            fill
            className="object-contain p-8 opacity-50"
            sizes={sizes}
          />
        ) : (
          <Image
            src={placeholderSrc}
            alt={alt}
            width={300}
            height={200}
            className="object-contain opacity-50"
          />
        )}
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${fill ? '' : className}`} />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        style={loading ? { opacity: 0 } : { opacity: 1 }}
      />
    </>
  );
}