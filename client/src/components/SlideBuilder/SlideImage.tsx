/**
 * Slide image component with retry/fallback logic
 * @see specs/007-gamma-smart-layout-engine/spec.md US2
 */
import React from 'react';
import { ImagePlaceholder } from './ImagePlaceholder';
import { useImageLoader } from '@/hooks/useImageLoader';
import { prevalidateImageUrl } from '@/lib/imageUtils';
import type { SlideImage as SlideImageType } from '@/stores/slideStore';

export interface SlideImageProps {
  image: SlideImageType;
  primaryColor?: string;
  iconName?: string;
  onRetry?: (imageId: string) => void;
}

export function SlideImage({ image, primaryColor = '#0891b2', iconName = 'Image', onRetry }: SlideImageProps) {
  const valid = prevalidateImageUrl(image.url);
  const { status: loadStatus, retry } = useImageLoader(valid && image.status === 'ready' ? image.url : null);

  const handleRetry = () => {
    if (image.status === 'failed') {
      onRetry?.(image.id);
    } else {
      retry();
    }
  };

  // Store says loading (no URL yet)
  if (image.status === 'loading') {
    return (
      <div className="w-full h-full min-h-[100px] rounded-lg overflow-hidden">
        <ImagePlaceholder
          gradientFrom={primaryColor}
          gradientTo={`${primaryColor}cc`}
          iconName={iconName}
          size="medium"
        />
      </div>
    );
  }

  // Store says failed (e.g. AI generation failed)
  if (image.status === 'failed') {
    return (
      <div className="w-full h-full min-h-[100px] rounded-lg overflow-hidden">
        <ImagePlaceholder
          gradientFrom={primaryColor}
          gradientTo={`${primaryColor}cc`}
          iconName="ImageOff"
          size="medium"
          showRetry
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // Store says ready - verify URL loads
  if (!valid || loadStatus === 'failed') {
    return (
      <div className="w-full h-full min-h-[100px] rounded-lg overflow-hidden">
        <ImagePlaceholder
          gradientFrom={primaryColor}
          gradientTo={`${primaryColor}cc`}
          iconName="ImageOff"
          size="medium"
          showRetry
          onRetry={retry}
        />
      </div>
    );
  }

  if (loadStatus === 'loading') {
    return (
      <div className="w-full h-full min-h-[100px] rounded-lg overflow-hidden">
        <ImagePlaceholder
          gradientFrom={primaryColor}
          gradientTo={`${primaryColor}cc`}
          iconName={iconName}
          size="medium"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[100px] rounded-lg overflow-hidden">
      <img src={image.url} alt="" className="w-full h-full object-cover" />
    </div>
  );
}
