import React from 'react';
import { TwoColumnLayout } from './TwoColumnLayout';
import { QuadrantLayout } from './QuadrantLayout';
import { CardGridLayout } from './CardGridLayout';
import { FlowLayout } from './FlowLayout';
import { StatBlocksLayout } from './StatBlocksLayout';
import { NumberedLayout } from './NumberedLayout';
import type { SlideLayoutProps } from './SlideLayoutTypes';

export type LayoutType =
  | 'two-column'
  | 'quadrant'
  | 'card-grid'
  | 'flow'
  | 'stat-blocks'
  | 'numbered'
  | 'cards'
  | 'list'
  | 'grid'
  | 'quote'
  | 'timeline'
  | 'table';

export const LAYOUT_REGISTRY: Record<LayoutType, React.FC<SlideLayoutProps>> = {
  'two-column': TwoColumnLayout,
  quadrant: QuadrantLayout,
  'card-grid': CardGridLayout,
  flow: FlowLayout,
  'stat-blocks': StatBlocksLayout,
  numbered: NumberedLayout,
  cards: CardGridLayout,
  list: NumberedLayout,
  grid: CardGridLayout,
  quote: NumberedLayout,
  timeline: FlowLayout,
  table: CardGridLayout,
};

export { TwoColumnLayout, QuadrantLayout, CardGridLayout, FlowLayout, StatBlocksLayout, NumberedLayout };
export type { SlideLayoutProps, ContentBlock, SlideDimensions } from './SlideLayoutTypes';
