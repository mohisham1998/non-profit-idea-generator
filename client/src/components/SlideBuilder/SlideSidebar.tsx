import { useSlideStore, SlideCard as SlideCardType } from '@/stores/slideStore';
import { SlideThumbnailPreview } from './SlideThumbnailPreview';
import { GripVertical, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Thumbnail dimensions (16:9) ──────────────────────────────────
const THUMB_W = 176;
const THUMB_H = Math.round(THUMB_W * 9 / 16); // ≈ 99px

interface SortableThumbnailProps {
  card: SlideCardType;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onOpenStyle: () => void;
}

function SortableThumbnail({ card, index, isSelected, onSelect, onOpenStyle }: SortableThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`
          rounded-lg transition-all duration-200 overflow-hidden
          ${isSelected
            ? 'ring-2 ring-blue-500 shadow-md'
            : 'ring-1 ring-gray-200 hover:ring-blue-300 hover:shadow-sm'}
          ${isDragging ? 'opacity-50 shadow-lg' : ''}
        `}
      >
        {/* Slide number + drag handle row */}
        <div className="flex items-center justify-between px-1.5 py-1 bg-gray-50 border-b border-gray-100">
          <span className={`text-[9px] font-bold ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
            {index + 1}
          </span>
          <div
            className="cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded p-0.5"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3 w-3 text-gray-400" />
          </div>
        </div>

        {/* Thumbnail preview */}
        <button
          onClick={() => onSelect()}
          className="block w-full focus:outline-none"
          style={{ height: `${THUMB_H}px` }}
        >
          <SlideThumbnailPreview card={card} />
        </button>

        {/* Slide title below preview */}
        <div className="px-1.5 py-1 bg-white">
          <p className={`text-[9px] font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
            {card.title}
          </p>
        </div>
      </div>
    </div>
  );
}

interface SlideSidebarProps {
  onOpenStyle?: (cardId: string) => void;
}

export function SlideSidebar({ onOpenStyle }: SlideSidebarProps) {
  const { cards, selectedCardId, selectCard, reorderCards } = useSlideStore();
  const [minimized, setMinimized] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((card) => card.id === active.id);
      const newIndex = cards.findIndex((card) => card.id === over.id);
      
      const newCards = arrayMove(cards, oldIndex, newIndex);
      reorderCards(newCards);
    }
  };
  
  if (minimized) {
    return (
      <div className="w-10 bg-white border-l border-gray-200 flex flex-col h-full shadow-sm items-center py-3 gap-3">
        <button
          onClick={() => setMinimized(false)}
          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors"
          title="إظهار الشرائح"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center gap-1.5 mt-2">
          {cards.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${cards[i]?.id === selectedCardId ? 'bg-blue-500' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-52 bg-white border-l border-gray-200 flex flex-col shadow-sm" style={{ height: '100%' }}>
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="font-semibold text-[11px] text-gray-600 uppercase tracking-wide">الشرائح</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">{cards.length} شريحة</p>
        </div>
        <button
          onClick={() => setMinimized(true)}
          className="w-6 h-6 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          title="تصغير"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable slides list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={cards.map(card => card.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="p-2 space-y-2">
              {cards.map((card, index) => (
                <SortableThumbnail
                  key={card.id}
                  card={card}
                  index={index}
                  isSelected={card.id === selectedCardId}
                  onSelect={() => selectCard(card.id)}
                  onOpenStyle={() => onOpenStyle?.(card.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-2 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs"
          disabled
        >
          <Plus className="h-3.5 w-3.5" />
          إضافة شريحة
        </Button>
      </div>
    </div>
  );
}
