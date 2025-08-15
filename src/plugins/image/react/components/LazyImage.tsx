import { memo, useEffect, useState } from 'react';

import { ImageNode } from '../../node/image-node';
import BrokenImage from './BrokenImage';
import { useSuspenseImage } from './useSupenseImage';

function isSVG(src: string): boolean {
  return src.toLowerCase().endsWith('.svg');
}

const LazyImage = memo<{
  className?: string | null;
  node: ImageNode;
  onError?: () => void;
}>(({ className, node, onError }) => {
  const { src, altText, maxWidth, width } = node;
  const [dimensions, setDimensions] = useState<{
    height: number;
    width: number;
  } | null>(null);
  const isSVGImage = isSVG(src);

  const hasError = useSuspenseImage(src);

  useEffect(() => {
    if (hasError && onError) {
      onError();
    }
  }, [hasError, onError]);

  if (hasError) {
    return <BrokenImage />;
  }

  // Calculate final dimensions with proper scaling
  const calculateDimensions = () => {
    if (!isSVGImage) {
      return {
        maxWidth,
        width,
      };
    }

    // Use natural dimensions if available, otherwise fallback to defaults
    const naturalWidth = dimensions?.width || 200;
    const naturalHeight = dimensions?.height || 200;

    let finalWidth = naturalWidth;
    let finalHeight = naturalHeight;

    // Scale down if width exceeds maxWidth while maintaining aspect ratio
    if (finalWidth > maxWidth) {
      const scale = maxWidth / finalWidth;
      finalWidth = maxWidth;
      finalHeight = Math.round(finalHeight * scale);
    }

    // Scale down if height exceeds maxHeight while maintaining aspect ratio
    const maxHeight = 500;
    if (finalHeight > maxHeight) {
      const scale = maxHeight / finalHeight;
      finalHeight = maxHeight;
      finalWidth = Math.round(finalWidth * scale);
    }

    return {
      maxWidth,
      width: finalWidth,
    };
  };

  const imageStyle = calculateDimensions();

  return (
    <img
      alt={altText}
      className={className || undefined}
      draggable="false"
      onError={onError}
      onLoad={(e) => {
        if (isSVGImage) {
          const img = e.currentTarget;
          setDimensions({
            height: img.naturalHeight,
            width: img.naturalWidth,
          });
        }
      }}
      src={src}
      style={{ ...imageStyle, cursor: 'default' }}
    />
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
