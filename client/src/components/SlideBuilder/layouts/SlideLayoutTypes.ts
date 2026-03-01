export interface ContentBlock {
  id: string;
  type: 'card' | 'badge' | 'header' | 'stat' | 'text' | 'icon';
  content: string | number;
  style?: { bold?: boolean; colorAccent?: boolean; iconName?: string };
  position?: { row?: number; col?: number };
}

export interface SlideDimensions {
  width: number;
  height: number;
  aspectRatio: string;
}

export interface SlideLayoutProps {
  type: string;
  contentBlocks: ContentBlock[];
  primaryColor: string;
  rtl: boolean;
  dimensions: SlideDimensions;
}
