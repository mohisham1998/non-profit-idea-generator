import React from 'react';
import { BLOCK_REGISTRY } from '../blocks';
import { ChevronDown } from 'lucide-react';
import type { SlideLayoutProps } from './SlideLayoutTypes';

export function FlowLayout({ contentBlocks, primaryColor, rtl, dimensions }: SlideLayoutProps) {
  const renderBlock = (block: (typeof contentBlocks)[0], isLast: boolean) => {
    const BlockComponent = BLOCK_REGISTRY[block.type];
    if (!BlockComponent) return null;
    return (
      <div key={block.id} className="flex flex-col items-center">
        <div className="w-full">
          <BlockComponent
            type={block.type}
            content={block.content}
            style={block.style}
            primaryColor={primaryColor}
            rtl={rtl}
          />
        </div>
        {!isLast && (
          <div className="flex items-center justify-center py-2" style={{ color: primaryColor }}>
            <ChevronDown className="h-6 w-6" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="p-6 space-y-2 overflow-y-auto"
      style={{ width: dimensions.width, height: dimensions.height, aspectRatio: dimensions.aspectRatio }}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      {contentBlocks.map((block, i) => renderBlock(block, i === contentBlocks.length - 1))}
    </div>
  );
}
