import React from 'react';
import { BLOCK_REGISTRY } from '../blocks';
import type { SlideLayoutProps } from './SlideLayoutTypes';

export function TwoColumnLayout({ contentBlocks, primaryColor, rtl, dimensions }: SlideLayoutProps) {
  const mid = Math.ceil(contentBlocks.length / 2);
  const left = contentBlocks.slice(0, mid);
  const right = contentBlocks.slice(mid);

  const renderBlock = (block: (typeof contentBlocks)[0]) => {
    const BlockComponent = BLOCK_REGISTRY[block.type];
    if (!BlockComponent) return null;
    return (
      <BlockComponent
        key={block.id}
        type={block.type}
        content={block.content}
        style={block.style}
        primaryColor={primaryColor}
        rtl={rtl}
      />
    );
  };

  return (
    <div
      className={`p-6 flex gap-8 ${rtl ? 'rtl flex-row-reverse' : 'ltr'}`}
      style={{ width: dimensions.width, height: dimensions.height, aspectRatio: dimensions.aspectRatio }}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      <div className="flex-1 space-y-4">{left.map(renderBlock)}</div>
      <div className="flex-1 space-y-4">{right.map(renderBlock)}</div>
    </div>
  );
}
