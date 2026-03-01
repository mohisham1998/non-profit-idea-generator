import React from 'react';
import { ContentBlockProps } from './ContentCard';

export function NumberedBadge({ content, primaryColor, rtl }: ContentBlockProps) {
  return (
    <div
      className={`flex items-center gap-3 ${rtl ? 'rtl flex-row-reverse' : 'ltr'}`}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      <div
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        {content}
      </div>
    </div>
  );
}
