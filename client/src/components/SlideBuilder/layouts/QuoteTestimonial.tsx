import { Quote } from 'lucide-react';
import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function QuoteTestimonial({ title, blocks, theme }: LayoutProps) {
  const quote = blocks.find((b) => b.type === 'quote') ?? blocks[0];
  const rest = blocks.filter((b) => b !== quote);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-4" style={{ color: theme.primaryColor }}>{title}</h2>
      <blockquote className="relative p-6 rounded-xl border-r-4" style={{ borderColor: theme.primaryColor, backgroundColor: theme.primaryColor + '10' }}>
        <Quote className="w-10 h-10 opacity-30 absolute top-2 right-2" style={{ color: theme.primaryColor }} />
        <p className="text-lg italic mb-2">{quote?.content}</p>
        {rest.length > 0 && <footer className="text-sm opacity-80">— {rest[0].content}</footer>}
      </blockquote>
    </LayoutBase>
  );
}
