import React from 'react';
import { ContentCard } from './ContentCard';
import { NumberedBadge } from './NumberedBadge';
import { SectionHeader } from './SectionHeader';
import { StatBlock } from './StatBlock';

export type ContentBlockType = 'card' | 'badge' | 'header' | 'stat' | 'text' | 'icon';

export interface ContentBlockProps {
  type: ContentBlockType;
  content: string | number;
  style?: { bold?: boolean; colorAccent?: boolean; iconName?: string };
  primaryColor: string;
  rtl: boolean;
}

function TextBlock({ content, rtl }: ContentBlockProps) {
  return (
    <p className="text-gray-700 leading-relaxed" dir={rtl ? 'rtl' : 'ltr'}>
      {content}
    </p>
  );
}

function IconBlock({ content, style, primaryColor }: ContentBlockProps) {
  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center"
      style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
    >
      <span className="text-lg font-bold">{String(content)}</span>
    </div>
  );
}

export const BLOCK_REGISTRY: Record<ContentBlockType, React.FC<ContentBlockProps>> = {
  card: ContentCard,
  badge: NumberedBadge,
  header: SectionHeader,
  stat: StatBlock,
  text: TextBlock,
  icon: IconBlock,
};

export { ContentCard, NumberedBadge, SectionHeader, StatBlock };
