import React from 'react';
import { BLOCK_REGISTRY } from '../blocks';
import type { SlideLayoutProps } from './SlideLayoutTypes';

export function NumberedLayout({ contentBlocks, primaryColor, rtl, dimensions }: SlideLayoutProps) {
  const renderBlock = (block: (typeof contentBlocks)[0], idx: number) => {
    const BlockComponent = BLOCK_REGISTRY[block.type];
    const enrichedBlock = {
      ...block,
      content: block.type === 'badge' ? idx + 1 : block.content,
      style: { ...block.style, colorAccent: true },
    };
    if (!BlockComponent) return null;
    return (
      <div key={block.id} className={`flex items-start gap-4 ${rtl ? 'rtl flex-row-reverse' : 'ltr'}`}>
        <div
          className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow"
          style={{ backgroundColor: primaryColor }}
        >
          {idx + 1}
        </div>
        <div className="flex-1">
          <BlockComponent
            type={enrichedBlock.type === 'badge' ? 'text' : enrichedBlock.type}
            content={block.content}
            style={enrichedBlock.style}
            primaryColor={primaryColor}
            rtl={rtl}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="p-6 space-y-4"
      style={{ width: dimensions.width, height: dimensions.height, aspectRatio: dimensions.aspectRatio }}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      {contentBlocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}
