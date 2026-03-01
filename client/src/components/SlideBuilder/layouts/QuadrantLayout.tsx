import React from 'react';
import { BLOCK_REGISTRY } from '../blocks';
import type { SlideLayoutProps } from './SlideLayoutTypes';

export function QuadrantLayout({ contentBlocks, primaryColor, rtl, dimensions }: SlideLayoutProps) {
  const perQuadrant = Math.ceil(contentBlocks.length / 4);
  const quadrants = [
    contentBlocks.slice(0, perQuadrant),
    contentBlocks.slice(perQuadrant, perQuadrant * 2),
    contentBlocks.slice(perQuadrant * 2, perQuadrant * 3),
    contentBlocks.slice(perQuadrant * 3),
  ];

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
      className="p-6 grid grid-cols-2 gap-4"
      style={{ width: dimensions.width, height: dimensions.height, aspectRatio: dimensions.aspectRatio }}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      {quadrants.map((items, i) => (
        <div key={i} className="rounded-xl p-4 bg-gray-50/80 border border-gray-100 space-y-2">
          {items.map(renderBlock)}
        </div>
      ))}
    </div>
  );
}
