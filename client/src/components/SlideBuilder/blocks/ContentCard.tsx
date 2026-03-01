import React from 'react';
import * as LucideIcons from 'lucide-react';

export interface ContentBlockStyle {
  bold?: boolean;
  colorAccent?: boolean;
  iconName?: string;
}

export interface ContentBlockProps {
  type: 'card' | 'badge' | 'header' | 'stat' | 'text' | 'icon';
  content: string | number;
  style?: ContentBlockStyle;
  primaryColor: string;
  rtl: boolean;
}

function getIconComponent(iconName?: string): React.ComponentType<{ className?: string; style?: React.CSSProperties }> | null {
  if (!iconName) return null;
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
  return Icon && typeof Icon === 'function' ? Icon : null;
}

export function ContentCard({ content, style, primaryColor, rtl }: ContentBlockProps) {
  const Icon = style?.iconName ? getIconComponent(style.iconName) : null;
  return (
    <div
      className={`flex items-start gap-3 rounded-xl p-4 shadow-sm border ${rtl ? 'rtl' : 'ltr'}`}
      style={{
        borderColor: style?.colorAccent ? `${primaryColor}40` : '#e5e7eb',
        backgroundColor: '#ffffff',
      }}
    >
      {Icon && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
      <p
        className={`text-gray-700 leading-relaxed ${style?.bold ? 'font-semibold' : ''}`}
        style={style?.colorAccent ? { color: primaryColor } : undefined}
        dir={rtl ? 'rtl' : 'ltr'}
      >
        {content}
      </p>
    </div>
  );
}
