import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ContentBlockProps } from './ContentCard';

function getIconComponent(iconName?: string): React.ComponentType<{ className?: string }> | null {
  if (!iconName) return null;
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
  return Icon && typeof Icon === 'function' ? Icon : null;
}

export function SectionHeader({ content, style, primaryColor, rtl }: ContentBlockProps) {
  const Icon = style?.iconName ? getIconComponent(style.iconName) : null;
  return (
    <div
      className={`flex items-center gap-3 mb-4 ${rtl ? 'rtl flex-row-reverse' : 'ltr'}`}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      {Icon && (
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      )}
      <h3
        className="text-xl font-bold text-gray-900"
        style={{ color: style?.colorAccent ? primaryColor : undefined }}
        dir={rtl ? 'rtl' : 'ltr'}
      >
        {content}
      </h3>
    </div>
  );
}
