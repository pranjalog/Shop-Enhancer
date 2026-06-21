import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSize?: number;
}

export default function ImageWithFallback({
  src,
  alt,
  className = "",
  fallbackSize = 48,
}: ImageWithFallbackProps) {
  const [errored, setErrored] = useState(false);

  // Reset error state whenever src changes
  useEffect(() => {
    setErrored(false);
  }, [src]);

  if (!src || errored) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <ShoppingBag size={fallbackSize} className="text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setErrored(true)}
    />
  );
}
