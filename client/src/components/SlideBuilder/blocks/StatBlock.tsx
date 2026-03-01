import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ContentBlockProps } from './ContentCard';

function getIconComponent(iconName?: string): React.ComponentType<{ className?: string }> | null {
  if (!iconName) return null;
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
  return Icon && typeof Icon === 'function' ? Icon : null;
}

export function StatBlock({ content, style, primaryColor, rtl }: ContentBlockProps) {
  const Icon = style?.iconName ? getIconComponent(style.iconName) : null;
  return (
    <div
      className={`rounded-xl p-4 border ${rtl ? 'rtl' : 'ltr'}`}
      style={{
        borderColor: `${primaryColor}40`,
        backgroundColor: `${primaryColor}08`,
      }}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      {Icon && (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
          style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <p
        className={`text-2xl font-bold ${style?.bold ? 'font-extrabold' : ''}`}
        style={{ color: primaryColor }}
        dir={rtl ? 'rtl' : 'ltr'}
      >
        {content}
      </p>
    </div>
  );
}
