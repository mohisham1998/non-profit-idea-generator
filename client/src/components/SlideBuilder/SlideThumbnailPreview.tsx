/**
 * SlideThumbnailPreview
 * Schematic thumbnail that mirrors SlideCard's exact gradient/color logic so
 * the thumbnail always matches what the user sees in the editor.
 */
import { SlideCard, CardStyle } from '@/stores/slideStore';

// ── Exact gradient pairs (hex) matching SlideCard's CUSTOM_THEMES / getHeaderColor / getCardBg ──

// Custom (per-section) gradients — mirror CUSTOM_THEMES in SlideCard.tsx
const SECTION_HEADER: Record<string, [string, string]> = {
  vision:             ['#9333ea', '#6d28d9'],   // purple-600 → violet-700
  generalObjective:   ['#2563eb', '#1e40af'],   // blue-600 → blue-800
  detailedObjectives: ['#6366f1', '#4338ca'],   // indigo-500 → indigo-700
  idea:               ['#f59e0b', '#ea580c'],   // amber-500 → orange-600
  justifications:     ['#14b8a6', '#0f766e'],   // teal-500 → teal-700
  features:           ['#d946ef', '#9333ea'],   // fuchsia-500 → purple-600
  strengths:          ['#16a34a', '#047857'],   // green-600 → emerald-700
  outputs:            ['#0ea5e9', '#0891b2'],   // sky-500 → cyan-600
  expectedResults:    ['#f43f5e', '#db2777'],   // rose-500 → pink-600
  risks:              ['#ef4444', '#be123c'],   // red-500 → rose-700
  proposedNames:      ['#8b5cf6', '#9333ea'],   // violet-500 → purple-600
};

const SECTION_BG: Record<string, [string, string]> = {
  vision:             ['#f5f3ff', '#ede9fe'],
  generalObjective:   ['#eff6ff', '#eef2ff'],
  detailedObjectives: ['#eef2ff', '#eff6ff'],
  idea:               ['#fffbeb', '#fff7ed'],
  justifications:     ['#f0fdfa', '#ecfdf5'],
  features:           ['#fdf4ff', '#f5f3ff'],
  strengths:          ['#f0fdf4', '#ecfdf5'],
  outputs:            ['#f0f9ff', '#ecfeff'],
  expectedResults:    ['#fff1f2', '#fdf2f8'],
  risks:              ['#fef2f2', '#fff1f2'],
  proposedNames:      ['#f5f3ff', '#faf5ff'],
};

// Per card-type default gradients (when colorTheme === 'default')
const TYPE_HEADER: Record<string, [string, string]> = {
  cover:          ['#374151', '#111827'],   // gray-700 → gray-900
  kpis:           ['#3b82f6', '#2563eb'],   // blue-500 → blue-600
  budget:         ['#10b981', '#059669'],   // emerald-500 → emerald-600
  swot:           ['#8b5cf6', '#7c3aed'],   // purple-500 → purple-600
  logframe:       ['#6366f1', '#4f46e5'],   // indigo-500 → indigo-600
  timeline:       ['#06b6d4', '#0891b2'],   // cyan-500 → cyan-600
  pmdpro:         ['#7c3aed', '#6d28d9'],
  designThinking: ['#f59e0b', '#d97706'],
  marketing:      ['#ec4899', '#db2777'],
  custom:         ['#6b7280', '#374151'],
};

const TYPE_BG: Record<string, [string, string]> = {
  cover:    ['#eff6ff', '#dbeafe'],
  kpis:     ['#eff6ff', '#e0f2fe'],
  budget:   ['#ecfdf5', '#d1fae5'],
  swot:     ['#faf5ff', '#f3e8ff'],
  logframe: ['#eef2ff', '#e0e7ff'],
  timeline: ['#ecfeff', '#cffafe'],
  custom:   ['#f9fafb', '#f3f4f6'],
};

// Explicit user colorTheme overrides — mirrors THEME_HEADER / THEME_BG in SlideCard.tsx
const THEME_HEADER: Record<string, [string, string]> = {
  gray:     ['#4b5563', '#1f2937'],
  blue:     ['#3b82f6', '#1d4ed8'],
  green:    ['#10b981', '#047857'],
  purple:   ['#8b5cf6', '#6d28d9'],
  orange:   ['#f97316', '#c2410c'],
  amber:    ['#f59e0b', '#b45309'],
  teal:     ['#14b8a6', '#0f766e'],
  rose:     ['#f43f5e', '#e11d48'],
  midnight: ['#475569', '#1e3a8a'],
};

const THEME_BG: Record<string, [string, string]> = {
  gray:     ['#f9fafb', '#f3f4f6'],
  blue:     ['#eff6ff', '#dbeafe'],
  green:    ['#ecfdf5', '#d1fae5'],
  purple:   ['#faf5ff', '#f3e8ff'],
  orange:   ['#fff7ed', '#fed7aa'],
  amber:    ['#fffbeb', '#fde68a'],
  teal:     ['#f0fdfa', '#ccfbf1'],
  rose:     ['#fff1f2', '#fecdd3'],
  midnight: ['#f1f5f9', '#e2e8f0'],
};

const THEME_KEY: Record<string, string> = {
  gray: 'gray', blue: 'blue', green: 'green', purple: 'purple',
  orange: 'orange', amber: 'amber', teal: 'teal', rose: 'rose', midnight: 'midnight',
};

// ── Resolve colors for a card ────────────────────────────────────
function resolveColors(card: SlideCard): {
  headerGrad: [string, string];
  bgGrad: [string, string];
} {
  const { type, style, content } = card;
  const ct = style.colorTheme;

  // 1. Explicit user theme overrides everything
  if (ct && ct !== 'default' && THEME_KEY[ct]) {
    return {
      headerGrad: THEME_HEADER[ct],
      bgGrad: THEME_BG[ct],
    };
  }

  // 2. Custom cards → per-section default
  if (type === 'custom' && content) {
    const sectionKey = Object.keys(content)[0] ?? '';
    if (SECTION_HEADER[sectionKey]) {
      return {
        headerGrad: SECTION_HEADER[sectionKey],
        bgGrad: SECTION_BG[sectionKey] ?? ['#f9fafb', '#f3f4f6'],
      };
    }
  }

  // 3. Per-type defaults
  return {
    headerGrad: TYPE_HEADER[type] ?? TYPE_HEADER.custom,
    bgGrad: TYPE_BG[type] ?? TYPE_BG.custom,
  };
}

// ── Content sketches ─────────────────────────────────────────────
function Lines({ color, widths }: { color: string; widths: number[] }) {
  return (
    <>
      {widths.map((w, i) => (
        <div key={i} style={{ height: 3, borderRadius: 2, background: '#e5e7eb', width: `${w}%`, marginBottom: 3 }} />
      ))}
    </>
  );
}

function SketchCover({ h }: { h: [string, string] }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-3"
         style={{ background: `linear-gradient(135deg, ${h[0]}22, ${h[1]}33)` }}>
      <div style={{ width: '65%', height: 5, borderRadius: 3, background: h[0] }} />
      <div style={{ width: '45%', height: 3, borderRadius: 2, background: h[0], opacity: 0.55 }} />
      <div style={{ width: '30%', height: 2, borderRadius: 2, background: h[0], opacity: 0.3, marginTop: 2 }} />
    </div>
  );
}

function SketchList({ h, rows = 5 }: { h: [string, string]; rows?: number }) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-1 px-3 py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: h[0], flexShrink: 0 }} />
          <div style={{ height: 3, borderRadius: 2, background: '#e5e7eb', flex: 1, maxWidth: `${78 - i * 6}%` }} />
        </div>
      ))}
    </div>
  );
}

function SketchKPIs({ h }: { h: [string, string] }) {
  return (
    <div className="flex-1 flex flex-col gap-1.5 px-2 py-2">
      {[75, 55, 85].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', border: `2px solid ${h[0]}`, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 3, borderRadius: 2, background: '#d1d5db', width: `${w}%`, marginBottom: 2 }} />
            <div style={{ height: 2, borderRadius: 2, background: `${h[0]}44`, width: '45%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SketchBudget({ h }: { h: [string, string] }) {
  return (
    <div className="flex-1 flex flex-col gap-1 px-2 py-2">
      <div style={{ textAlign: 'center', marginBottom: 3 }}>
        <div style={{ height: 4, borderRadius: 2, background: h[0], width: '45%', margin: '0 auto' }} />
      </div>
      {[80, 55, 70, 40, 65].map((w, i) => (
        <div key={i} style={{ height: 3, borderRadius: 2, background: '#f3f4f6', overflow: 'hidden' }}>
          <div style={{ height: 3, borderRadius: 2, background: `linear-gradient(to right, ${h[0]}, ${h[1]})`, width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

function SketchSWOT() {
  const q = [
    ['#dcfce7', '#86efac'], ['#fee2e2', '#fca5a5'],
    ['#dbeafe', '#93c5fd'], ['#fef9c3', '#fde047'],
  ];
  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, padding: '5px 5px' }}>
      {q.map(([bg, border], i) => (
        <div key={i} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 3, padding: '3px 4px' }}>
          <div style={{ height: 2.5, borderRadius: 1, background: border, width: '60%', marginBottom: 2 }} />
          <div style={{ height: 2, borderRadius: 1, background: border, opacity: 0.5, width: '80%', marginBottom: 1 }} />
          <div style={{ height: 2, borderRadius: 1, background: border, opacity: 0.4, width: '65%' }} />
        </div>
      ))}
    </div>
  );
}

function SketchLogFrame({ h }: { h: [string, string] }) {
  return (
    <div style={{ flex: 1, padding: '4px 5px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ height: 6, borderRadius: 2, background: `${h[0]}33`, border: `1px solid ${h[0]}66` }} />
      {[1, 2, 3].map(r => (
        <div key={r} style={{ display: 'flex', gap: 2 }}>
          {[1, 2, 3, 4].map(c => (
            <div key={c} style={{ flex: 1, height: 5, borderRadius: 1, background: r === 1 ? `${h[0]}22` : '#f3f4f6', border: '1px solid #e5e7eb' }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function SketchTimeline({ h }: { h: [string, string] }) {
  return (
    <div style={{ flex: 1, padding: '5px 8px', display: 'flex', flexDirection: 'column', gap: 5, justifyContent: 'center' }}>
      {[60, 80, 45, 70].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: h[0], flexShrink: 0 }} />
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: '#e5e7eb', overflow: 'hidden' }}>
            <div style={{ width: `${w}%`, height: 3, background: h[0], opacity: 0.65, borderRadius: 2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────
export function SlideThumbnailPreview({ card }: { card: SlideCard }) {
  const { type, title, content } = card;
  const { headerGrad, bgGrad } = resolveColors(card);

  // Pick the content sketch based on card type (and section key for custom)
  const sectionKey = type === 'custom' ? (Object.keys(content || {})[0] ?? '') : '';

  const renderSketch = () => {
    switch (type) {
      case 'cover':         return <SketchCover h={headerGrad} />;
      case 'kpis':          return <SketchKPIs h={headerGrad} />;
      case 'budget':        return <SketchBudget h={headerGrad} />;
      case 'swot':          return <SketchSWOT />;
      case 'logframe':      return <SketchLogFrame h={headerGrad} />;
      case 'timeline':      return <SketchTimeline h={headerGrad} />;
      case 'custom': {
        // Single-text sections → big text block style
        if (['vision', 'generalObjective', 'idea'].includes(sectionKey)) {
          return (
            <div style={{ flex: 1, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${headerGrad[0]}22`, border: `1.5px solid ${headerGrad[0]}55`, margin: '2px auto 4px' }} />
              <Lines color={headerGrad[0]} widths={[90, 85, 78, 60]} />
            </div>
          );
        }
        // List sections
        return <SketchList h={headerGrad} rows={5} />;
      }
      default:
        return <SketchList h={headerGrad} rows={4} />;
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRadius: 4,
      background: `linear-gradient(135deg, ${bgGrad[0]}, ${bgGrad[1]})`,
    }}>
      {/* Header band — matches the card's actual gradient header */}
      <div style={{
        flexShrink: 0,
        height: 20,
        background: `linear-gradient(to left, ${headerGrad[0]}, ${headerGrad[1]})`,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '0 6px',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
        <span style={{
          fontSize: 5.5,
          fontWeight: 700,
          color: '#fff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
          direction: 'rtl',
        }}>
          {title}
        </span>
      </div>

      {/* Content sketch */}
      {renderSketch()}
    </div>
  );
}
