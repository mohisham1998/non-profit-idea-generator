import React from 'react';
import { BLOCK_REGISTRY } from '../blocks';
import type { SlideLayoutProps } from './SlideLayoutTypes';

export function StatBlocksLayout({ contentBlocks, primaryColor, rtl, dimensions }: SlideLayoutProps) {
  const blockCount = contentBlocks.length;
  const gridCols = blockCount > 12 ? 'grid-cols-2 md:grid-cols-4' : blockCount > 6 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3';
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
    <div className="relative">
      <div
        className={`p-6 grid ${gridCols} gap-3 sm:gap-4 overflow-auto max-h-[70vh] scroll-smooth`}
        style={{ width: dimensions.width, height: dimensions.height, aspectRatio: dimensions.aspectRatio }}
        dir={rtl ? 'rtl' : 'ltr'}
      >
        {contentBlocks.map(renderBlock)}
      </div>
      {blockCount > 6 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-full shadow-sm pointer-events-none">
          <span>{rtl ? 'مرر للأسفل' : 'Scroll for more'}</span>
          <span className="animate-bounce">↓</span>
        </div>
      )}
    </div>
  );
}
